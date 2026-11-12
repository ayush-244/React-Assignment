const PICSUM_ORIGIN = 'https://picsum.photos/v2/list'

/** Initial live attempt budget (~4s). */
export const DIRECT_TIMEOUT_MS = 4000
/** Short proxy hop only if direct fails quickly; keeps total near ~5s. */
export const PROXY_TIMEOUT_MS = 1000
/** Overall client budget for one live page fetch. */
export const LIVE_FETCH_BUDGET_MS = 5000

/**
 * Official Picsum list URL (primary data source).
 */
export function getDirectPicsumUrl(page, limit = 10) {
  return `${PICSUM_ORIGIN}?page=${page}&limit=${limit}`
}

/**
 * Optional same-origin proxy URL.
 * Used only after a failed/fast direct attempt — never duplicates a long wait.
 */
export function getProxyPicsumUrl(page, limit = 10) {
  const configured = import.meta.env.VITE_PICSUM_API_BASE?.replace(/\/$/, '')
  if (configured) {
    return `${configured}?page=${page}&limit=${limit}`
  }
  return `/api/picsum?page=${page}&limit=${limit}`
}

function mergeSignals(externalSignal, timeoutMs) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  const onAbort = () => controller.abort()
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort()
    } else {
      externalSignal.addEventListener('abort', onAbort, { once: true })
    }
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timer)
      externalSignal?.removeEventListener('abort', onAbort)
    },
  }
}

async function fetchJsonOnce(url, externalSignal, timeoutMs) {
  const { signal, cleanup } = mergeSignals(externalSignal, timeoutMs)

  try {
    const response = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
    })

    const raw = await response.text()

    let parsed = null
    if (raw) {
      try {
        parsed = JSON.parse(raw)
      } catch {
        parsed = null
      }
    }

    if (!response.ok) {
      const message =
        parsed?.error ||
        `Failed to load photos (HTTP ${response.status})`
      const error = new Error(message)
      error.status = response.status
      throw error
    }

    if (!Array.isArray(parsed)) {
      throw new Error('Unexpected Picsum API response shape')
    }

    if (parsed.length > 0) {
      const sample = parsed[0]
      if (!sample?.author || !sample?.download_url) {
        throw new Error('Picsum response missing required author/download_url fields')
      }
    }

    return parsed
  } finally {
    cleanup()
  }
}

/**
 * Fetch one page of real Picsum photos.
 *
 * Strategy (bounded ~5s):
 * 1. One direct HTTPS request (~4s timeout)
 * 2. At most one short proxy attempt with remaining budget (~1s)
 *
 * No long sequential retries. Never uses fixtures.
 */
export async function fetchPicsumPage(page, limit = 10, signal) {
  const started = Date.now()
  const directUrl = getDirectPicsumUrl(page, limit)
  const proxyUrl = getProxyPicsumUrl(page, limit)
  const errors = []

  try {
    const data = await fetchJsonOnce(directUrl, signal, DIRECT_TIMEOUT_MS)
    return { data, source: 'live', endpoint: 'direct' }
  } catch (error) {
    if (error.name === 'AbortError' && signal?.aborted) throw error
    errors.push(`direct: ${error.name === 'AbortError' ? 'Timed out while contacting Picsum' : error.message}`)
  }

  const elapsed = Date.now() - started
  const remaining = LIVE_FETCH_BUDGET_MS - elapsed

  // Skip proxy if the budget is already spent (avoids doubling wait time).
  if (remaining < 400 || signal?.aborted) {
    throw new Error(`Picsum API is currently unreachable. ${errors.join(' | ')}`)
  }

  try {
    const data = await fetchJsonOnce(
      proxyUrl,
      signal,
      Math.min(PROXY_TIMEOUT_MS, remaining),
    )
    return { data, source: 'live', endpoint: 'proxy' }
  } catch (error) {
    if (error.name === 'AbortError' && signal?.aborted) throw error
    errors.push(`proxy: ${error.name === 'AbortError' ? 'Timed out while contacting Picsum' : error.message}`)
  }

  throw new Error(
    `Picsum API is currently unreachable. ${errors.join(' | ')}`,
  )
}
