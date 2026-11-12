/**
 * Dev/preview middleware that forwards `/api/picsum` to the live Picsum API.
 * Production static hosting uses `api/picsum.js` (Vercel) instead — never this file.
 * Never serves fixture/sample photo data.
 */

const UPSTREAM = 'https://picsum.photos/v2/list'
/** Bounded upstream wait; client also caps proxy hop (~1s remaining of 5s budget). */
const TIMEOUT_MS = 3500

async function fetchUpstream(page, limit) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(`${UPSTREAM}?page=${page}&limit=${limit}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    clearTimeout(timeout)

    const text = await response.text()

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: `Picsum API returned HTTP ${response.status}`,
        body: text.slice(0, 200),
      }
    }

    JSON.parse(text)
    return { ok: true, body: text }
  } catch (error) {
    clearTimeout(timeout)
    return {
      ok: false,
      status: 502,
      error:
        error.name === 'AbortError'
          ? 'Timed out while contacting the Picsum API'
          : error.message || 'Failed to reach the Picsum API',
    }
  }
}

function createPicsumProxyMiddleware() {
  return async function picsumProxy(req, res, next) {
    const pathOnly = req.url?.split('?')[0]
    if (pathOnly !== '/api/picsum') {
      next()
      return
    }

    const requestUrl = new URL(req.url, 'http://localhost')
    const page = Number(requestUrl.searchParams.get('page') || '1')
    const limit = Number(requestUrl.searchParams.get('limit') || '10')

    const upstream = await fetchUpstream(page, limit)

    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')

    if (upstream.ok) {
      res.setHeader('X-Picsum-Source', 'live')
      res.statusCode = 200
      res.end(upstream.body)
      return
    }

    res.setHeader('X-Picsum-Source', 'error')
    res.statusCode = upstream.status || 502
    res.end(JSON.stringify({ error: upstream.error || 'Picsum API unavailable' }))
  }
}

export function picsumProxyPlugin() {
  return {
    name: 'picsum-live-proxy',
    configureServer(server) {
      server.middlewares.use(createPicsumProxyMiddleware())
    },
    configurePreviewServer(server) {
      server.middlewares.use(createPicsumProxyMiddleware())
    },
  }
}
