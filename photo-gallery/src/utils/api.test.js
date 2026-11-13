import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PAGE_1, PAGE_2 } from '../test/picsumFixtures'
import {
  DIRECT_TIMEOUT_MS,
  LIVE_FETCH_BUDGET_MS,
  fetchPicsumPage,
  getDirectPicsumUrl,
  getProxyPicsumUrl,
} from './api'

function jsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(data),
  }
}

describe('Picsum API helpers', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('builds the official direct Picsum endpoint', () => {
    expect(getDirectPicsumUrl(1, 10)).toBe(
      'https://picsum.photos/v2/list?page=1&limit=10',
    )
    expect(getDirectPicsumUrl(2, 10)).toBe(
      'https://picsum.photos/v2/list?page=2&limit=10',
    )
    expect(getDirectPicsumUrl(3, 10)).toBe(
      'https://picsum.photos/v2/list?page=3&limit=10',
    )
  })

  it('uses same-origin proxy path as a secondary option', () => {
    expect(getProxyPicsumUrl(1, 10)).toBe('/api/picsum?page=1&limit=10')
  })

  it('keeps a short live request budget', () => {
    expect(DIRECT_TIMEOUT_MS).toBe(4000)
    expect(LIVE_FETCH_BUDGET_MS).toBe(5000)
  })

  it('fetches page 1 from the direct Picsum URL with real schema fields', async () => {
    fetch.mockResolvedValueOnce(jsonResponse(PAGE_1))

    const result = await fetchPicsumPage(1, 10)

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch.mock.calls[0][0]).toBe('https://picsum.photos/v2/list?page=1&limit=10')
    expect(result.endpoint).toBe('direct')
    expect(result.source).toBe('live')
    expect(result.data).toHaveLength(3)
    expect(result.data[0]).toMatchObject({
      id: '0',
      author: 'Alejandro Escamilla',
      download_url: expect.stringContaining('https://picsum.photos/id/0/'),
    })
  })

  it('fetches page 2 from the official endpoint', async () => {
    fetch.mockResolvedValueOnce(jsonResponse(PAGE_2))

    const result = await fetchPicsumPage(2, 10)

    expect(fetch.mock.calls[0][0]).toBe('https://picsum.photos/v2/list?page=2&limit=10')
    expect(result.data[0].author).toBe('Paul Jarvis')
    expect(result.data[0].download_url).toContain('/id/11/')
  })

  it('falls back to a single short proxy attempt after direct fails', async () => {
    fetch
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(jsonResponse(PAGE_1))

    const result = await fetchPicsumPage(1, 10)

    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch.mock.calls[0][0]).toBe('https://picsum.photos/v2/list?page=1&limit=10')
    expect(fetch.mock.calls[1][0]).toBe('/api/picsum?page=1&limit=10')
    expect(result.endpoint).toBe('proxy')
    expect(result.data[0].download_url).toBeTruthy()
  })

  it('rejects responses missing author or download_url', async () => {
    fetch.mockResolvedValue(
      jsonResponse([{ id: '9', width: 100, height: 100, url: 'https://example.com' }]),
    )

    await expect(fetchPicsumPage(1, 10)).rejects.toThrow(
      /missing required author\/download_url/i,
    )
  })

  it('does not retry the direct endpoint repeatedly', async () => {
    fetch.mockRejectedValue(new Error('offline'))

    await expect(fetchPicsumPage(1, 10)).rejects.toThrow(/unreachable/i)
    // 1 direct + 1 proxy only
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
