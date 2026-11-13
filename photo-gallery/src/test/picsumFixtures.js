/**
 * Test-only mock payloads matching the official Picsum /v2/list schema.
 * Never imported by production UI code.
 */

export function createPicsumPhoto({
  id,
  author,
  width = 1200,
  height = 800,
  slug = 'example',
}) {
  return {
    id: String(id),
    author,
    width,
    height,
    url: `https://unsplash.com/photos/${slug}`,
    download_url: `https://picsum.photos/id/${id}/${width}/${height}`,
  }
}

export const PAGE_1 = [
  createPicsumPhoto({ id: '0', author: 'Alejandro Escamilla', slug: 'yC-Yzbqy7PY' }),
  createPicsumPhoto({ id: '1', author: 'Alejandro Escamilla', slug: 'LNRyGwIJr5c' }),
  createPicsumPhoto({ id: '10', author: 'Paul Jarvis', slug: '6J--NXulQCs' }),
]

export const PAGE_2 = [
  createPicsumPhoto({ id: '11', author: 'Paul Jarvis', slug: 'CmKUGN6OVUw' }),
  createPicsumPhoto({ id: '12', author: 'Paul Jarvis', slug: 'I_9ILwtsl_k' }),
  createPicsumPhoto({ id: '13', author: 'Paul Jarvis', slug: '3MtiSMdnoEo' }),
]

export const PAGE_3 = [
  createPicsumPhoto({ id: '14', author: 'Paul Jarvis', slug: 'IQ1kOQTJrOQ' }),
  createPicsumPhoto({ id: '15', author: 'Paul Jarvis', slug: 'NY_5fpxUlHo' }),
  // Intentional duplicate of a page-1 id to verify client-side dedupe.
  createPicsumPhoto({ id: '0', author: 'Alejandro Escamilla', slug: 'yC-Yzbqy7PY' }),
]

export const EMPTY_PAGE = []

export const PAGES_BY_NUMBER = {
  1: PAGE_1,
  2: PAGE_2,
  3: PAGE_3,
  4: EMPTY_PAGE,
}
