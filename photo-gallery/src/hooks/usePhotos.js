import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { fetchPicsumPage } from '../utils/api'
import { fetchDemoPage } from '../utils/demoApi'

const LIVE_LIKES_KEY = 'exactspace-gallery-likes'
const DEMO_LIKES_KEY = 'exactspace-gallery-demo-likes'

/**
 * Shared initial live fetch so React Strict Mode remounts reuse one in-flight
 * request instead of aborting and starting a duplicate.
 */
let sharedInitialLivePromise = null
let sharedInitialLiveController = null

function startSharedInitialLiveFetch() {
  if (sharedInitialLivePromise) return sharedInitialLivePromise

  sharedInitialLiveController = new AbortController()
  const promise = fetchPicsumPage(1, 10, sharedInitialLiveController.signal).finally(() => {
    // Keep the settled promise briefly so Strict Mode remount can still await it.
    queueMicrotask(() => {
      if (sharedInitialLivePromise === promise) {
        sharedInitialLivePromise = null
        sharedInitialLiveController = null
      }
    })
  })
  sharedInitialLivePromise = promise
  return promise
}

function cancelSharedInitialLiveFetch() {
  sharedInitialLiveController?.abort()
  sharedInitialLivePromise = null
  sharedInitialLiveController = null
}

export function usePhotos() {
  const [mode, setMode] = useState('live') // 'live' | 'demo'
  const [photos, setPhotos] = useState([])
  const [page, setPage] = useState(0)
  // Start in loading so the skeleton appears on first paint (before effects).
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [liveLikes, setLiveLikes] = useLocalStorage(LIVE_LIKES_KEY, {})
  const [demoLikes, setDemoLikes] = useLocalStorage(DEMO_LIKES_KEY, {})

  const modeRef = useRef(mode)
  const seenIdsRef = useRef(new Set())
  const abortRef = useRef(null)
  const requestIdRef = useRef(0)
  const hasMoreRef = useRef(true)
  const pageRef = useRef(0)
  const statusRef = useRef('loading')

  useEffect(() => {
    statusRef.current = status
  }, [status])

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  const resetFeedState = useCallback(() => {
    seenIdsRef.current = new Set()
    pageRef.current = 0
    hasMoreRef.current = true
    setPhotos([])
    setPage(0)
    setHasMore(true)
    setError(null)
  }, [])

  const applyPageData = useCallback((pageToLoad, data, { replace }) => {
    if (!Array.isArray(data) || data.length === 0) {
      setHasMore(false)
      hasMoreRef.current = false
      statusRef.current = 'success'
      setStatus('success')
      return
    }

    if (replace) {
      seenIdsRef.current = new Set()
    }

    const uniqueItems = data.filter((item) => {
      const id = String(item.id)
      if (seenIdsRef.current.has(id)) return false
      seenIdsRef.current.add(id)
      return true
    })

    setPhotos((prev) => (replace ? uniqueItems : [...prev, ...uniqueItems]))
    setPage(pageToLoad)
    pageRef.current = pageToLoad
    setHasMore(true)
    hasMoreRef.current = true
    statusRef.current = 'success'
    setStatus('success')
  }, [])

  const fetchPageForMode = useCallback(async (activeMode, pageToLoad, { replace = false } = {}) => {
    if (!replace && (statusRef.current === 'loading' || statusRef.current === 'loadingMore')) {
      return
    }
    if (!replace && !hasMoreRef.current) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const requestId = ++requestIdRef.current

    const nextStatus = replace || pageRef.current === 0 ? 'loading' : 'loadingMore'
    statusRef.current = nextStatus
    setStatus(nextStatus)
    setError(null)

    try {
      const result =
        activeMode === 'demo'
          ? await fetchDemoPage(pageToLoad, controller.signal)
          : await fetchPicsumPage(pageToLoad, 10, controller.signal)

      if (requestId !== requestIdRef.current || modeRef.current !== activeMode) return
      applyPageData(pageToLoad, result.data, { replace })
    } catch (err) {
      if (err.name === 'AbortError') return
      if (requestId !== requestIdRef.current || modeRef.current !== activeMode) return
      setError(err.message || 'Something went wrong while loading photos')
      statusRef.current = 'error'
      setStatus('error')
    }
  }, [applyPageData])

  // Initial live load only (Strict Mode–safe shared in-flight request).
  useEffect(() => {
    const requestId = ++requestIdRef.current

    const loadInitialLive = async () => {
      try {
        const { data } = await startSharedInitialLiveFetch()
        if (requestId !== requestIdRef.current || modeRef.current !== 'live') return
        applyPageData(1, data, { replace: true })
      } catch (err) {
        if (err.name === 'AbortError') return
        if (requestId !== requestIdRef.current || modeRef.current !== 'live') return
        setError(err.message || 'Something went wrong while loading photos')
        statusRef.current = 'error'
        setStatus('error')
      }
    }

    void loadInitialLive()

    return () => {
      // Invalidate this subscriber only. Do not abort the shared request here —
      // Strict Mode cleanup would otherwise force a duplicate second fetch.
      if (requestId === requestIdRef.current) {
        requestIdRef.current += 1
      }
    }
  }, [applyPageData])

  const loadMore = useCallback(() => {
    if (statusRef.current === 'loading' || statusRef.current === 'loadingMore') return
    if (!hasMoreRef.current) return
    void fetchPageForMode(modeRef.current, pageRef.current + 1)
  }, [fetchPageForMode])

  const retryLive = useCallback(() => {
    cancelSharedInitialLiveFetch()
    setMode('live')
    modeRef.current = 'live'
    resetFeedState()
    void fetchPageForMode('live', 1, { replace: true })
  }, [fetchPageForMode, resetFeedState])

  const enterDemoMode = useCallback(() => {
    // Cancel any in-flight live request so it cannot overwrite demo state.
    cancelSharedInitialLiveFetch()
    abortRef.current?.abort()
    requestIdRef.current += 1
    setMode('demo')
    modeRef.current = 'demo'
    resetFeedState()
    void fetchPageForMode('demo', 1, { replace: true })
  }, [fetchPageForMode, resetFeedState])

  const returnToLive = useCallback(() => {
    cancelSharedInitialLiveFetch()
    abortRef.current?.abort()
    requestIdRef.current += 1
    setMode('live')
    modeRef.current = 'live'
    resetFeedState()
    void fetchPageForMode('live', 1, { replace: true })
  }, [fetchPageForMode, resetFeedState])

  const likePhoto = useCallback((id) => {
    const key = String(id)
    const setter = modeRef.current === 'demo' ? setDemoLikes : setLiveLikes
    setter((prev) => ({
      ...prev,
      [key]: (prev[key] ?? 0) + 1,
    }))
  }, [setDemoLikes, setLiveLikes])

  const getLikes = useCallback(
    (id) => {
      const store = mode === 'demo' ? demoLikes : liveLikes
      return store[String(id)] ?? 0
    },
    [demoLikes, liveLikes, mode],
  )

  return {
    mode,
    isDemo: mode === 'demo',
    photos,
    page,
    status,
    error,
    hasMore,
    loadMore,
    retryLive,
    enterDemoMode,
    returnToLive,
    likePhoto,
    getLikes,
  }
}
