import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'
import { motion } from 'motion/react'
import { ImageOff } from 'lucide-react'

export default function PhotoCard({
  photo,
  likes,
  onLike,
  onOpen,
  priority = false,
}) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  const imageSrc = photo.download_url
  const altText = `Photograph by ${photo.author}`

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-[var(--shadow-soft)] transition hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-panel)]"
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
        <button
          type="button"
          onClick={() => onOpen(photo)}
          className="group relative block w-full overflow-hidden rounded-xl bg-[var(--color-surface-muted)] text-left sm:w-56 sm:shrink-0 md:w-72"
          aria-label={`View larger photo by ${photo.author}`}
        >
          <div className="aspect-[16/10] sm:aspect-[4/3]">
            {!failed ? (
              <img
                src={imageSrc}
                alt={altText}
                width={photo.width}
                height={photo.height}
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={priority ? 'high' : 'auto'}
                onLoad={() => setLoaded(true)}
                onError={() => setFailed(true)}
                className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.02] ${
                  loaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[var(--color-text-subtle)]">
                <ImageOff size={28} aria-hidden="true" />
                <span className="text-xs">Image unavailable</span>
              </div>
            )}

            {!loaded && !failed && (
              <div className="absolute inset-0 animate-pulse bg-[var(--color-border)]" />
            )}
          </div>
        </button>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
          <div>
            <p className="text-xs font-medium tracking-wide text-[var(--color-text-subtle)] uppercase">
              Author
            </p>
            <h2 className="mt-1 truncate text-lg font-semibold text-[var(--color-text)]">
              {photo.author}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {photo.width} × {photo.height}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onLike(photo.id)}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 text-sm font-medium text-[var(--color-text)] transition hover:border-[var(--color-like)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-like)]"
              aria-label={`Like photo by ${photo.author}. Current likes: ${likes}`}
            >
              <FontAwesomeIcon
                icon={faThumbsUp}
                className="text-[var(--color-like)]"
                aria-hidden="true"
              />
              <span>{likes}</span>
            </button>

            <button
              type="button"
              onClick={() => onOpen(photo)}
              className="text-sm font-medium text-[var(--color-accent)] transition hover:text-[var(--color-accent-hover)]"
            >
              View details
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
