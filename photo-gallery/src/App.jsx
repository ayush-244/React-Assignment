import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUp, Images, LoaderCircle, RefreshCw } from 'lucide-react'
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
    isDemo,
    photos,
    status,
    error,
    hasMore,
    loadMore,
    retryLive,
    enterDemoMode,
    returnToLive,
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
        isDemo={isDemo}
      />

      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        {isDemo ? (
          <div
            className="mb-5 flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100 sm:flex-row sm:items-center sm:justify-between"
            role="status"
          >
            <p className="font-medium">
              DEMO MODE — Sample photos. Live Picsum API is unavailable.
            </p>
            <button
              type="button"
              onClick={returnToLive}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-amber-400/70 bg-white px-3 py-1.5 text-xs font-semibold text-amber-950 transition hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-50 dark:hover:bg-amber-900/50"
            >
              <RefreshCw size={14} aria-hidden="true" />
              Return to Live Gallery
            </button>
          </div>
        ) : null}

        {status === 'loading' && photos.length === 0 ? (
          <div className="space-y-5">
            <div
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3 text-sm text-[var(--color-text-muted)] shadow-[var(--shadow-soft)]"
              role="status"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  {isDemo
                    ? 'Loading demo gallery…'
                    : 'Contacting the live Picsum API… This usually finishes within a few seconds.'}
                </p>
                {!isDemo ? (
                  <button
                    type="button"
                    onClick={enterDemoMode}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] hover:border-[var(--color-border-strong)]"
                  >
                    <Images size={14} aria-hidden="true" />
                    View Demo Gallery
                  </button>
                ) : null}
              </div>
            </div>
            <div aria-busy="true" aria-label="Loading photos">
              <div className="space-y-5">
                <PhotoSkeleton />
                <PhotoSkeleton />
                <PhotoSkeleton />
              </div>
            </div>
          </div>
        ) : null}

        {status === 'error' && photos.length === 0 && !isDemo ? (
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
            <p className="mx-auto mt-3 max-w-md text-xs text-[var(--color-text-subtle)]">
              Live mode uses only the official Picsum API
              (`picsum.photos/v2/list`). Demo Mode is optional and clearly labeled.
            </p>
            <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={retryLive}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)]"
              >
                <RefreshCw size={16} aria-hidden="true" />
                Retry Live API
              </button>
              <button
                type="button"
                onClick={enterDemoMode}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] hover:border-[var(--color-border-strong)]"
              >
                <Images size={16} aria-hidden="true" />
                View Demo Gallery
              </button>
            </div>
          </div>
        ) : null}

        {status === 'success' && photos.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-14 text-center">
            <h2 className="text-lg font-semibold">No photos found</h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              {isDemo
                ? 'The demo feed returned an empty first page.'
                : 'The Picsum feed returned an empty first page.'}
            </p>
          </div>
        ) : null}

        {photos.length > 0 ? (
          <div className="space-y-5">
            {photos.map((photo, index) => (
              <PhotoCard
                key={`${isDemo ? 'demo' : 'live'}-${photo.id}`}
                photo={photo}
                likes={getLikes(photo.id)}
                onLike={likePhoto}
                onOpen={setSelectedPhoto}
                priority={index === 0}
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
              onClick={isDemo ? enterDemoMode : retryLive}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm font-medium"
            >
              <RefreshCw size={14} aria-hidden="true" />
              Try again
            </button>
          </div>
        ) : null}

        {!hasMore && photos.length > 0 ? (
          <p className="py-10 text-center text-sm text-[var(--color-text-muted)]">
            {isDemo
              ? 'You’ve reached the end of the demo gallery.'
              : 'You’ve reached the end of the gallery.'}
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
