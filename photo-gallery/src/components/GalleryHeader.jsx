import { Images } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function GalleryHeader({ theme, onToggleTheme, photoCount }) {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_90%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
            aria-hidden="true"
          >
            <Images size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight text-[var(--color-text)] sm:text-2xl">
              Photo gallery
            </h1>
            <p className="truncate text-sm text-[var(--color-text-muted)]">
              {photoCount > 0
                ? `${photoCount} photos loaded from Picsum`
                : 'Infinite scroll photography feed'}
            </p>
          </div>
        </div>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  )
}
