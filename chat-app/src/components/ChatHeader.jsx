import { MessageSquareText, Trash2 } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function ChatHeader({ theme, onToggleTheme, messageCount, onClear }) {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
            aria-hidden="true"
          >
            <MessageSquareText size={20} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold tracking-tight text-[var(--color-text)] sm:text-lg">
              Exactspace Chat
            </h1>
            <p className="truncate text-xs text-[var(--color-text-muted)] sm:text-sm">
              {messageCount === 0
                ? 'No messages yet'
                : `${messageCount} message${messageCount === 1 ? '' : 's'}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messageCount > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 text-xs font-medium text-[var(--color-text-muted)] transition hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"
              aria-label="Clear all messages"
            >
              <Trash2 size={14} aria-hidden="true" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  )
}
