import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { EMOJI_CATEGORIES, searchEmojis } from '../utils/emojis'

export default function EmojiPicker({ open, onClose, onSelect, anchorRef }) {
  const [query, setQuery] = useState('')
  const panelRef = useRef(null)
  const searchRef = useRef(null)
  const titleId = useId()

  const filtered = useMemo(() => searchEmojis(query), [query])

  useEffect(() => {
    if (!open) return undefined

    const frame = window.requestAnimationFrame(() => {
      searchRef.current?.focus()
    })

    const handlePointerDown = (event) => {
      const target = event.target
      if (
        panelRef.current?.contains(target) ||
        anchorRef?.current?.contains(target)
      ) {
        return
      }
      onClose()
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose, anchorRef])


  if (!open) return null

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      className="absolute bottom-[calc(100%+0.75rem)] left-0 z-30 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-[var(--shadow-panel)]"
    >
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-3 py-2.5">
        <h2 id={titleId} className="text-sm font-semibold text-[var(--color-text)]">
          Emoji
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]"
          aria-label="Close emoji picker"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="border-b border-[var(--color-border)] px-3 py-2">
        <label className="relative block">
          <span className="sr-only">Search emojis</span>
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)]"
            aria-hidden="true"
          />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search emoji…"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pr-3 pl-9 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-subtle)] focus:border-[var(--color-accent)]"
          />
        </label>
      </div>

      <div className="chat-scroll max-h-56 overflow-y-auto p-2">
        {query.trim() ? (
          filtered.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-[var(--color-text-muted)]">
              No emojis found
            </p>
          ) : (
            <div className="grid grid-cols-8 gap-1">
              {filtered.map((emoji) => (
                <button
                  key={`search-${emoji}`}
                  type="button"
                  className="flex h-9 items-center justify-center rounded-lg text-xl transition hover:bg-[var(--color-accent-soft)]"
                  onClick={() => onSelect(emoji)}
                  aria-label={`Insert ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )
        ) : (
          EMOJI_CATEGORIES.map((category) => (
            <section key={category.id} className="mb-3 last:mb-0">
              <h3 className="px-2 pb-1 text-[11px] font-semibold tracking-wide text-[var(--color-text-subtle)] uppercase">
                {category.label}
              </h3>
              <div className="grid grid-cols-8 gap-1">
                {category.emojis.map((emoji) => (
                  <button
                    key={`${category.id}-${emoji}`}
                    type="button"
                    className="flex h-9 items-center justify-center rounded-lg text-xl transition hover:bg-[var(--color-accent-soft)]"
                    onClick={() => onSelect(emoji)}
                    aria-label={`Insert ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  )
}
