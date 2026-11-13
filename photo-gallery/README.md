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
npm run build
npm run lint
npm run preview
```

## API

```text
https://picsum.photos/v2/list?page=1&limit=10
https://picsum.photos/v2/list?page=2&limit=10
...
```

Pagination continues until an empty page is returned.
