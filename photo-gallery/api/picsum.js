/**
 * Production serverless proxy for the official Picsum list API.
 * Works on Vercel as `/api/picsum`.
 *
 * Always fetches real data from https://picsum.photos — never fixtures.
 */
const UPSTREAM = 'https://picsum.photos/v2/list'
const TIMEOUT_MS = 3500

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const page = Number(req.query.page || 1)
  const limit = Number(req.query.limit || 10)

  if (!Number.isFinite(page) || page < 1 || !Number.isFinite(limit) || limit < 1) {
    res.status(400).json({ error: 'Invalid page or limit' })
    return
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const upstream = await fetch(`${UPSTREAM}?page=${page}&limit=${limit}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })

    clearTimeout(timer)

    if (!upstream.ok) {
      res.status(upstream.status).json({
        error: `Picsum API returned HTTP ${upstream.status}`,
      })
      return
    }

    const data = await upstream.json()

    if (!Array.isArray(data)) {
      res.status(502).json({ error: 'Unexpected Picsum API response shape' })
      return
    }

    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    res.setHeader('X-Picsum-Source', 'live')
    res.status(200).json(data)
  } catch (error) {
    clearTimeout(timer)
    const message =
      error.name === 'AbortError'
        ? 'Timed out while contacting the Picsum API'
        : error.message || 'Failed to reach the Picsum API'

    res.status(502).json({ error: message })
  }
}
