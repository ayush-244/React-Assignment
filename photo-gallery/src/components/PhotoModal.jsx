import { useEffect, useId, useRef, useState } from 'react'
import { ImageOff, X } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'

export default function PhotoModal({ photo, likes, onLike, onClose }) {
  const titleId = useId()
  const closeRef = useRef(null)
  const [failedPhotoId, setFailedPhotoId] = useState(null)
  const imageFailed = Boolean(photo) && failedPhotoId === photo.id

  useEffect(() => {
    if (!photo) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [photo, onClose])

  if (!photo) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-[var(--shadow-panel)] sm:rounded-3xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2 id={titleId} className="truncate text-base font-semibold text-[var(--color-text)]">
              {photo.author}
            </h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              ID {photo.id} · {photo.width} × {photo.height}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]"
            aria-label="Close photo details"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto">
          {!imageFailed ? (
            <img
              src={photo.download_url}
              alt={`Photograph by ${photo.author}`}
              width={photo.width}
              height={photo.height}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              onError={() => setFailedPhotoId(photo.id)}
              className="max-h-[60dvh] w-full object-contain bg-black"
            />
          ) : (
            <div className="flex max-h-[60dvh] min-h-48 w-full flex-col items-center justify-center gap-2 bg-black text-white/70">
              <ImageOff size={32} aria-hidden="true" />
              <span className="text-sm">Image unavailable</span>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
            <a
              href={photo.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-[var(--color-accent)] hover:underline"
            >
              Open on Picsum / Unsplash
            </a>
            <button
              type="button"
              onClick={() => onLike(photo.id)}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-3.5 py-2 text-sm font-medium"
              aria-label={`Like photo by ${photo.author}`}
            >
              <FontAwesomeIcon icon={faThumbsUp} className="text-[var(--color-like)]" />
              <span>{likes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
