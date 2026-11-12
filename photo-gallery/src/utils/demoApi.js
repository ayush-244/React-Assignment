/**
 * Explicit Demo Mode data source.
 * Completely separate from the live Picsum API integration in `api.js`.
 *
 * Demo JSON lives under `/demo/picsum/` and uses Unsplash CDN image URLs
 * (requires internet for photographs). It is never used unless the user
 * clicks "View Demo Gallery".
 */

export function getDemoPageUrl(page) {
  return `/demo/picsum/page-${page}.json`
}

/**
 * Downscale Unsplash/demo CDN URLs for faster card rendering.
 * Preserves aspect ratio via fit=crop; does not alter live Picsum URLs.
 */
export function optimizeDemoImageUrl(url, { width = 720, quality = 70 } = {}) {
  if (!url || typeof url !== 'string') return url

  try {
    const parsed = new URL(url)
    if (!parsed.hostname.includes('images.unsplash.com')) {
      return url
    }
    parsed.searchParams.set('auto', 'format')
    parsed.searchParams.set('fit', 'crop')
    parsed.searchParams.set('w', String(width))
    parsed.searchParams.set('q', String(quality))
    return parsed.toString()
  } catch {
    return url
  }
}

function normalizeDemoPhoto(photo) {
  return {
    ...photo,
    download_url: optimizeDemoImageUrl(photo.download_url, { width: 720, quality: 70 }),
  }
}

/**
 * Fetch one demo page. Returns Picsum-shaped objects:
 * { id, author, width, height, url, download_url }
 */
export async function fetchDemoPage(page, signal) {
  const response = await fetch(getDemoPageUrl(page), {
    signal,
    headers: { Accept: 'application/json' },
  })

  if (response.status === 404) {
    return { data: [], source: 'demo' }
  }

  if (!response.ok) {
    throw new Error(`Failed to load demo page ${page} (HTTP ${response.status})`)
  }

  const data = await response.json()
  if (!Array.isArray(data)) {
    throw new Error('Unexpected demo feed shape')
  }

  if (data.length > 0) {
    const sample = data[0]
    if (!sample?.author || !sample?.download_url) {
      throw new Error('Demo feed missing required author/download_url fields')
    }
  }

  return {
    data: data.map(normalizeDemoPhoto),
    source: 'demo',
  }
}
