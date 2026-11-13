import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUp, LoaderCircle, RefreshCw } from 'lucide-react'
import GalleryHeader from './components/GalleryHeader'
import PhotoCard from './components/PhotoCard'
import PhotoModal from './components/PhotoModal'
import PhotoSkeleton from './components/PhotoSkeleton'
import { useInfiniteScroll } from './hooks/useInfiniteScroll'
import { usePhotos } from './hooks/usePhotos'
import { useTheme } from './hooks/useTheme'

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const {
    photos,
    status,
    error,
    hasMore,
    usingFallback,
    loadMore,
    retry,
    likePhoto,
    getLikes,
  } = usePhotos()

  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [showTop, setShowTop] = useState(false)
  const sentinelRef = useRef(null)

  const handleIntersect = useCallback(() => {
    loadMore()
  }, [loadMore])

  useInfiniteScroll({
    targetRef: sentinelRef,
    enabled: hasMore && status !== 'loading' && status !== 'error',
    onIntersect: handleIntersect,
  })

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 480)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-dvh bg-[var(--color-surface-muted)]">
      <GalleryHeader
        theme={theme}
        onToggleTheme={toggleTheme}
        photoCount={photos.length}
      />

      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        {usingFallback ? (
          <div
            className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100"
            role="status"
          >
            Picsum API is currently unreachable, so a local fixture feed is shown.
            Infinite scroll, likes, and layout behavior still match the live integration.
          </div>
        ) : null}

        {status === 'loading' && photos.length === 0 ? (
          <div className="space-y-5" aria-busy="true" aria-label="Loading photos">
            <PhotoSkeleton />
            <PhotoSkeleton />
            <PhotoSkeleton />
          </div>
        ) : null}

        {status === 'error' && photos.length === 0 ? (
          <div
            className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-6 py-14 text-center shadow-[var(--shadow-soft)]"
            role="alert"
          >
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Couldn’t load the gallery
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-text-muted)]">
              {error}
            </p>
            <button
              type="button"
              onClick={retry}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)]"
            >
              <RefreshCw size={16} aria-hidden="true" />
              Retry
            </button>
          </div>
        ) : null}

        {status === 'success' && photos.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-14 text-center">
            <h2 className="text-lg font-semibold">No photos found</h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              The Picsum feed returned an empty first page.
            </p>
          </div>
        ) : null}

        {photos.length > 0 ? (
          <div className="space-y-5">
            {photos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                likes={getLikes(photo.id)}
                onLike={likePhoto}
                onOpen={setSelectedPhoto}
              />
            ))}
          </div>
        ) : null}

        <div ref={sentinelRef} className="h-8 w-full" aria-hidden="true" />

        {status === 'loadingMore' ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-[var(--color-text-muted)]">
            <LoaderCircle className="animate-spin" size={18} aria-hidden="true" />
            Loading more photos…
          </div>
        ) : null}

        {status === 'error' && photos.length > 0 ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-center dark:border-red-500/30 dark:bg-red-500/10">
            <p className="text-sm text-[var(--color-danger)]">{error}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm font-medium"
            >
              <RefreshCw size={14} aria-hidden="true" />
              Try again
            </button>
          </div>
        ) : null}

        {!hasMore && photos.length > 0 ? (
          <p className="py-10 text-center text-sm text-[var(--color-text-muted)]">
            You’ve reached the end of the gallery.
          </p>
        ) : null}
      </main>

      {showTop ? (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed right-4 bottom-4 z-30 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-accent)] text-white shadow-[var(--shadow-panel)] hover:bg-[var(--color-accent-hover)] sm:right-6 sm:bottom-6"
          aria-label="Scroll to top"
        >
          <ArrowUp size={18} aria-hidden="true" />
        </button>
      ) : null}

      <PhotoModal
        photo={selectedPhoto}
        likes={selectedPhoto ? getLikes(selectedPhoto.id) : 0}
        onLike={likePhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </div>
  )
}
