import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PAGE_1 } from '../test/picsumFixtures'
import { fetchDemoPage, getDemoPageUrl, optimizeDemoImageUrl } from './demoApi'

function jsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(data),
    json: async () => data,
  }
}

describe('demoApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('loads demo pages from /demo/picsum, not the live Picsum API', async () => {
    expect(getDemoPageUrl(1)).toBe('/demo/picsum/page-1.json')
    fetch.mockResolvedValueOnce(jsonResponse(PAGE_1))

    const result = await fetchDemoPage(1)

    expect(fetch).toHaveBeenCalledWith(
      '/demo/picsum/page-1.json',
      expect.objectContaining({ headers: { Accept: 'application/json' } }),
    )
    expect(result.source).toBe('demo')
    expect(result.data[0]).toMatchObject({
      author: 'Alejandro Escamilla',
      download_url: expect.any(String),
    })
  })

  it('treats missing demo pages as end of feed', async () => {
    fetch.mockResolvedValueOnce(jsonResponse(null, 404))
    const result = await fetchDemoPage(4)
    expect(result).toEqual({ data: [], source: 'demo' })
  })

  it('downscales Unsplash demo image URLs for faster delivery', () => {
    const optimized = optimizeDemoImageUrl(
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      { width: 720, quality: 70 },
    )
    expect(optimized).toContain('w=720')
    expect(optimized).toContain('q=70')
  })
})
