import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { fetchPicsumPage } from '../utils/api'

const LIKES_KEY = 'exactspace-gallery-likes'

export function usePhotos() {
  const [photos, setPhotos] = useState([])
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [usingFallback, setUsingFallback] = useState(false)
  const [likes, setLikes] = useLocalStorage(LIKES_KEY, {})

  const seenIdsRef = useRef(new Set())
  const abortRef = useRef(null)
  const requestIdRef = useRef(0)
  const hasMoreRef = useRef(true)
  const pageRef = useRef(0)
  const statusRef = useRef('idle')

  useEffect(() => {
    statusRef.current = status
  }, [status])

  const applyPageData = useCallback((pageToLoad, data, { replace, source }) => {
    if (!Array.isArray(data) || data.length === 0) {
      setHasMore(false)
      hasMoreRef.current = false
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
    setUsingFallback(source === 'fixture-fallback')
    setStatus('success')
  }, [])

  const fetchPage = useCallback(async (pageToLoad, { replace = false } = {}) => {
    if (!replace && (statusRef.current === 'loading' || statusRef.current === 'loadingMore')) {
      return
    }
    if (!replace && !hasMoreRef.current) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const requestId = ++requestIdRef.current

    setStatus(replace || pageRef.current === 0 ? 'loading' : 'loadingMore')
    setError(null)

    try {
      const { data, source } = await fetchPicsumPage(pageToLoad, 10, controller.signal)
      if (requestId !== requestIdRef.current) return
      applyPageData(pageToLoad, data, { replace, source })
    } catch (err) {
      if (err.name === 'AbortError') return
      if (requestId !== requestIdRef.current) return
      setError(err.message || 'Something went wrong while loading photos')
      setStatus('error')
    }
  }, [applyPageData])

  useEffect(() => {
    const controller = new AbortController()
    abortRef.current = controller
    const requestId = ++requestIdRef.current

    const loadInitial = async () => {
      setStatus('loading')
      setError(null)

      try {
        const { data, source } = await fetchPicsumPage(1, 10, controller.signal)
        if (requestId !== requestIdRef.current) return
        applyPageData(1, data, { replace: true, source })
      } catch (err) {
        if (err.name === 'AbortError') return
        if (requestId !== requestIdRef.current) return
        setError(err.message || 'Something went wrong while loading photos')
        setStatus('error')
      }
    }

    void loadInitial()

    return () => {
      controller.abort()
    }
  }, [applyPageData])

  const loadMore = useCallback(() => {
    if (statusRef.current === 'loading' || statusRef.current === 'loadingMore') return
    if (!hasMoreRef.current) return
    void fetchPage(pageRef.current + 1)
  }, [fetchPage])

  const retry = useCallback(() => {
    if (pageRef.current === 0 || photos.length === 0) {
      setHasMore(true)
      hasMoreRef.current = true
      void fetchPage(1, { replace: true })
      return
    }
    void fetchPage(pageRef.current + 1)
  }, [fetchPage, photos.length])

  const likePhoto = useCallback((id) => {
    const key = String(id)
    setLikes((prev) => ({
      ...prev,
      [key]: (prev[key] ?? 0) + 1,
    }))
  }, [setLikes])

  const getLikes = useCallback(
    (id) => likes[String(id)] ?? 0,
    [likes],
  )

  return {
    photos,
    page,
    status,
    error,
    hasMore,
    usingFallback,
    loadMore,
    retry,
    likePhoto,
    getLikes,
  }
}
