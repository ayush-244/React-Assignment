import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FIXTURE_DIR = path.join(__dirname, 'public', 'fixtures', 'picsum')

function readFixture(page) {
  const filePath = path.join(FIXTURE_DIR, `page-${page}.json`)
  if (!fs.existsSync(filePath)) {
    return '[]'
  }
  return fs.readFileSync(filePath, 'utf8')
}

async function fetchUpstream(page, limit) {
  const url = `https://picsum.photos/v2/list?page=${page}&limit=${limit}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 4000)

  try {
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`Upstream HTTP ${response.status}`)
    }

    const text = await response.text()
    JSON.parse(text)
    return { ok: true, body: text, fromCache: false }
  } catch (error) {
    clearTimeout(timeout)
    return { ok: false, error }
  }
}

function createPicsumProxyMiddleware() {
  return async function picsumProxy(req, res, next) {
    if (!req.url?.startsWith('/api/picsum/v2/list')) {
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
      res.end(upstream.body)
      return
    }

    const fixture = readFixture(page)
    res.setHeader('X-Picsum-Source', 'fixture-fallback')
    res.setHeader('X-Picsum-Fallback-Reason', String(upstream.error?.message || upstream.error))
    res.statusCode = 200
    res.end(fixture)
  }
}

export function picsumProxyPlugin() {
  return {
    name: 'picsum-proxy-fallback',
    configureServer(server) {
      server.middlewares.use(createPicsumProxyMiddleware())
    },
    configurePreviewServer(server) {
      server.middlewares.use(createPicsumProxyMiddleware())
    },
  }
}
