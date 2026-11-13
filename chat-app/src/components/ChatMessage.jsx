import { useState } from 'react'
import { Check, Copy, Heart } from 'lucide-react'
import { motion } from 'motion/react'
import { getAvatarColors, getInitials } from '../utils/users'
import { formatFullTimestamp, formatTimestamp } from '../utils/formatTime'
import { user_list } from '../utils/users'

function renderMessageContent(text) {
  const mentionPattern = new RegExp(`(@(?:${user_list.join('|')}))`, 'g')
  const parts = text.split(mentionPattern)

  return parts.map((part, index) => {
    if (user_list.some((user) => `@${user}` === part)) {
      return (
        <span
          key={`${part}-${index}`}
          className="rounded-md bg-[var(--color-mention-bg)] px-1.5 py-0.5 font-medium text-[var(--color-mention)]"
        >
          {part}
        </span>
      )
    }

    return <span key={`text-${index}`}>{part}</span>
  })
}

export default function ChatMessage({ message, onLike }) {
  const [copied, setCopied] = useState(false)
  const colors = getAvatarColors(message.username)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="group flex gap-3 rounded-2xl border border-transparent px-2 py-2 transition hover:border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)] sm:px-3"
      aria-label={`Message from ${message.username}`}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
        style={{ backgroundColor: colors.bg, color: colors.text }}
        aria-hidden="true"
      >
        {getInitials(message.username)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-sm font-semibold text-[var(--color-text)]">
            {message.username}
          </span>
          <time
            className="text-xs text-[var(--color-text-subtle)]"
            dateTime={message.createdAt}
            title={formatFullTimestamp(message.createdAt)}
          >
            {formatTimestamp(message.createdAt)}
          </time>
        </div>

        <div className="rounded-2xl rounded-tl-md bg-[var(--color-bubble)] px-3.5 py-2.5 text-sm leading-relaxed text-[var(--color-text)] shadow-[var(--shadow-soft)] whitespace-pre-wrap break-words">
          {renderMessageContent(message.text)}
        </div>

        <div className="mt-2 flex items-center gap-1">
          <button
            type="button"
            onClick={() => onLike(message.id)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-muted)] transition hover:border-red-300 hover:bg-red-50 hover:text-[var(--color-like)] dark:hover:border-red-500/40 dark:hover:bg-red-500/10"
            aria-label={`Like message from ${message.username}. Current likes: ${message.likes}`}
          >
            <Heart
              size={14}
              className={message.likes > 0 ? 'fill-[var(--color-like)] text-[var(--color-like)]' : ''}
              aria-hidden="true"
            />
            <span>{message.likes}</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-[var(--color-text-subtle)] opacity-100 transition hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-muted)] sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
            aria-label="Copy message"
          >
            {copied ? (
              <>
                <Check size={14} aria-hidden="true" />
                Copied
              </>
            ) : (
              <>
                <Copy size={14} aria-hidden="true" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>
    </motion.article>
  )
}
