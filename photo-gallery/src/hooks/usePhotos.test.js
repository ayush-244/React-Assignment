import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EMPTY_PAGE, PAGE_1, PAGE_2, PAGE_3 } from '../test/picsumFixtures'
import { fetchPicsumPage } from '../utils/api'
import { fetchDemoPage } from '../utils/demoApi'
import { usePhotos } from './usePhotos'

vi.mock('../utils/api', () => ({
  fetchPicsumPage: vi.fn(),
}))

vi.mock('../utils/demoApi', () => ({
  fetchDemoPage: vi.fn(),
}))

describe('usePhotos infinite scroll integration (mocked Picsum)', () => {
  beforeEach(() => {
    fetchPicsumPage.mockReset()
    fetchDemoPage.mockReset()
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('loads page 1 with author and download_url fields', async () => {
    fetchPicsumPage.mockResolvedValueOnce({ data: PAGE_1, source: 'live', endpoint: 'direct' })

    const { result } = renderHook(() => usePhotos())

    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(fetchPicsumPage).toHaveBeenCalledWith(1, 10, expect.any(AbortSignal))
    expect(result.current.photos).toHaveLength(3)
    expect(result.current.isDemo).toBe(false)
    expect(result.current.photos[0]).toMatchObject({
      id: '0',
      author: 'Alejandro Escamilla',
      download_url: expect.stringContaining('picsum.photos/id/0'),
    })
    expect(result.current.hasMore).toBe(true)
  })

  it('appends page 2 and page 3 without removing previous photos', async () => {
    fetchPicsumPage
      .mockResolvedValueOnce({ data: PAGE_1, source: 'live', endpoint: 'direct' })
      .mockResolvedValueOnce({ data: PAGE_2, source: 'live', endpoint: 'direct' })
      .mockResolvedValueOnce({ data: PAGE_3, source: 'live', endpoint: 'direct' })

    const { result } = renderHook(() => usePhotos())
    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.photos).toHaveLength(3)

    await act(async () => {
      result.current.loadMore()
    })
    await waitFor(() => expect(result.current.photos).toHaveLength(6))
    expect(result.current.page).toBe(2)

    await act(async () => {
      result.current.loadMore()
    })
    await waitFor(() => expect(result.current.photos.length).toBeGreaterThan(6))

    expect(result.current.photos).toHaveLength(8)
    expect(result.current.photos.map((photo) => photo.id)).toEqual([
      '0', '1', '10', '11', '12', '13', '14', '15',
    ])
    expect(fetchPicsumPage.mock.calls.map((call) => call[0])).toEqual([1, 2, 3])
  })

  it('stops loading when the API returns an empty array', async () => {
    fetchPicsumPage
      .mockResolvedValueOnce({ data: PAGE_1, source: 'live', endpoint: 'direct' })
      .mockResolvedValueOnce({ data: EMPTY_PAGE, source: 'live', endpoint: 'direct' })

    const { result } = renderHook(() => usePhotos())
    await waitFor(() => expect(result.current.status).toBe('success'))

    await act(async () => {
      result.current.loadMore()
    })

    await waitFor(() => expect(result.current.hasMore).toBe(false))
    expect(result.current.photos).toHaveLength(3)

    const callsBefore = fetchPicsumPage.mock.calls.length
    await act(async () => {
      result.current.loadMore()
    })
    expect(fetchPicsumPage.mock.calls.length).toBe(callsBefore)
  })

  it('supports independent unlimited like counters', async () => {
    fetchPicsumPage.mockResolvedValueOnce({ data: PAGE_1, source: 'live', endpoint: 'direct' })

    const { result } = renderHook(() => usePhotos())
    await waitFor(() => expect(result.current.photos).toHaveLength(3))

    await act(async () => {
      result.current.likePhoto('0')
      result.current.likePhoto('0')
      result.current.likePhoto('0')
      result.current.likePhoto('1')
    })

    expect(result.current.getLikes('0')).toBe(3)
    expect(result.current.getLikes('1')).toBe(1)
    expect(result.current.getLikes('10')).toBe(0)
  })

  it('does not issue duplicate in-flight loadMore requests', async () => {
    let resolvePage2
    fetchPicsumPage
      .mockResolvedValueOnce({ data: PAGE_1, source: 'live', endpoint: 'direct' })
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolvePage2 = () =>
              resolve({ data: PAGE_2, source: 'live', endpoint: 'direct' })
          }),
      )

    const { result } = renderHook(() => usePhotos())
    await waitFor(() => expect(result.current.status).toBe('success'))

    await act(async () => {
      result.current.loadMore()
      result.current.loadMore()
      result.current.loadMore()
    })

    expect(fetchPicsumPage.mock.calls.filter((call) => call[0] === 2)).toHaveLength(1)

    await act(async () => {
      resolvePage2()
    })
    await waitFor(() => expect(result.current.photos).toHaveLength(6))
  })

  it('cancels pending live requests when entering demo mode during loading', async () => {
    let resolveLive
    fetchPicsumPage.mockImplementationOnce(
      (_page, _limit, signal) =>
        new Promise((resolve, reject) => {
          resolveLive = () =>
            resolve({ data: PAGE_1, source: 'live', endpoint: 'direct' })
          signal?.addEventListener('abort', () => {
            const err = new Error('Aborted')
            err.name = 'AbortError'
            reject(err)
          })
        }),
    )
    fetchDemoPage.mockResolvedValueOnce({ data: PAGE_2, source: 'demo' })

    const { result } = renderHook(() => usePhotos())
    await waitFor(() => expect(result.current.status).toBe('loading'))

    await act(async () => {
      result.current.enterDemoMode()
    })

    await waitFor(() => expect(result.current.isDemo).toBe(true))
    await waitFor(() => expect(result.current.photos).toHaveLength(3))
    expect(result.current.photos[0].id).toBe('11')

    // Late live resolution must not overwrite demo state.
    await act(async () => {
      resolveLive?.()
    })
    expect(result.current.isDemo).toBe(true)
    expect(result.current.photos[0].id).toBe('11')
  })

  it('enters demo mode only via explicit action and keeps likes separate', async () => {
    fetchPicsumPage.mockRejectedValueOnce(new Error('Picsum unreachable'))
    fetchDemoPage
      .mockResolvedValueOnce({ data: PAGE_1, source: 'demo' })
      .mockResolvedValueOnce({ data: PAGE_2, source: 'demo' })

    const { result } = renderHook(() => usePhotos())
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.isDemo).toBe(false)
    expect(fetchDemoPage).not.toHaveBeenCalled()

    await act(async () => {
      result.current.enterDemoMode()
    })

    await waitFor(() => expect(result.current.isDemo).toBe(true))
    await waitFor(() => expect(result.current.photos).toHaveLength(3))
    expect(fetchDemoPage).toHaveBeenCalledWith(1, expect.any(AbortSignal))

    await act(async () => {
      result.current.likePhoto('0')
      result.current.likePhoto('0')
      result.current.loadMore()
    })

    await waitFor(() => expect(result.current.photos).toHaveLength(6))
    expect(result.current.getLikes('0')).toBe(2)

    fetchPicsumPage.mockResolvedValueOnce({ data: PAGE_1, source: 'live', endpoint: 'direct' })
    await act(async () => {
      result.current.returnToLive()
    })

    await waitFor(() => expect(result.current.isDemo).toBe(false))
    await waitFor(() => expect(result.current.photos).toHaveLength(3))
    // Live likes store is separate from demo likes.
    expect(result.current.getLikes('0')).toBe(0)
  })
})
