/**
 * Resolve the Picsum list URL.
 *
 * Always prefers the real Picsum API.
 * - Production / static hosting: fetch `https://picsum.photos` directly.
 *   The Vite proxy plugin is NOT used in production builds.
 * - Development only: use `/api/picsum` so Vite middleware can forward to the
 *   live Picsum API first (assignment-suggested proxy for CORS/connectivity).
 * - Optional override: `VITE_PICSUM_API_BASE`
 *
 * Fixture fallback happens only after the primary request fails
 * (see `fetchPicsumPage`).
 */
export function getPicsumListUrl(page, limit = 10) {
  const configured = import.meta.env.VITE_PICSUM_API_BASE

  if (configured) {
    return `${configured}/v2/list?page=${page}&limit=${limit}`
  }

  // Dev-only proxy path. Stripped from production bundles via import.meta.env.DEV.
  if (import.meta.env.DEV) {
    return `/api/picsum/v2/list?page=${page}&limit=${limit}`
  }

  return `https://picsum.photos/v2/list?page=${page}&limit=${limit}`
}

export function getFixtureUrl(page) {
  return `/fixtures/picsum/page-${page}.json`
}

export async function fetchPicsumPage(page, limit = 10, signal) {
  const primaryUrl = getPicsumListUrl(page, limit)

  try {
    // 1) Always attempt real Picsum (or the configured/live-forwarding primary URL) first.
    const response = await fetch(primaryUrl, { signal })
    if (!response.ok) {
      throw new Error(`Failed to load photos (HTTP ${response.status})`)
    }

    const data = await response.json()
    if (!Array.isArray(data)) {
      throw new Error('Unexpected API response shape')
    }

    // Dev proxy may label fixture responses; direct Picsum has no such header.
    const headerSource = response.headers.get('X-Picsum-Source')
    const source = headerSource === 'fixture-fallback' ? 'fixture-fallback' : 'live'
    return { data, source }
  } catch (error) {
    if (error.name === 'AbortError') throw error

    // 2) Only when the primary API request fails, use labeled local fixtures.
    const fixtureResponse = await fetch(getFixtureUrl(page), { signal })

    // Missing fixture pages intentionally end the feed (empty array).
    if (fixtureResponse.status === 404) {
      return {
        data: [],
        source: 'fixture-fallback',
        fallbackReason: error.message,
      }
    }

    if (!fixtureResponse.ok) {
      throw error
    }

    const data = await fixtureResponse.json()
    if (!Array.isArray(data)) {
      throw error
    }

    return { data, source: 'fixture-fallback', fallbackReason: error.message }
  }
}
