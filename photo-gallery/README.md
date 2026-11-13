# Exactspace Photo Gallery

Single-column infinite-scroll photo feed for the Exactspace Technologies internship assignment.

## Features

- Live Picsum Photos API integration
- One-column responsive layout
- Intersection Observer infinite scrolling
- Font Awesome thumbs-up likes (increment on every click)
- Skeleton loaders, error/retry, end-of-feed state
- Detail modal, theme toggle, LocalStorage like persistence

## Commands

```bash
npm install
npm run dev
npm test
npm run build
npm run lint
npm run preview
```

`npm test` runs Vitest with **mocked** Picsum-shaped HTTP responses only.

### Live vs Demo Mode

- **Live (default):** official `https://picsum.photos/v2/list` only.
- **Demo Mode:** optional. Activated only via **View Demo Gallery** after a live failure. Uses `/demo/picsum/page-*.json` and shows a clear DEMO MODE banner. Demo image URLs point at Unsplash CDN (internet required for photos; Picsum is not called).
- **Return to Live Gallery** exits demo mode and retries Picsum.

## API

Official source (always):

```text
https://picsum.photos/v2/list?page=1&limit=10
https://picsum.photos/v2/list?page=2&limit=10
...
```

The client tries:

1. Direct `https://picsum.photos/v2/list` (primary, with limited retries + backoff)
2. Same-origin `/api/picsum?page=&limit=` only if direct fails (Vercel serverless in production / Vite live forwarder in development)

Both paths return real Picsum JSON only. If the API is down, the UI shows an error with Retry — no sample fixtures.

Pagination continues until an empty page is returned.
