import { useMemo, useRef, useState } from 'react'
import { SendHorizontal, Smile } from 'lucide-react'
import EmojiPicker from './EmojiPicker'
import MentionDropdown from './MentionDropdown'
import { user_list } from '../utils/users'

function getMentionState(value, cursor) {
  const textBeforeCursor = value.slice(0, cursor)
  const match = textBeforeCursor.match(/(^|\s)@([A-Za-z]*)$/)

  if (!match) {
    return { active: false, query: '', start: -1 }
  }

  const query = match[2]
  const start = match.index + match[1].length

  return { active: true, query, start }
}

function insertAtCursor(value, start, end, insertion) {
  return {
    nextValue: `${value.slice(0, start)}${insertion}${value.slice(end)}`,
    nextCursor: start + insertion.length,
  }
}

export default function ChatInput({ onSend, disabled = false }) {
  const [value, setValue] = useState('')
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [mentionOpen, setMentionOpen] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionStart, setMentionStart] = useState(-1)
  const [activeMentionIndex, setActiveMentionIndex] = useState(0)
  const [error, setError] = useState('')

  const textareaRef = useRef(null)
  const emojiButtonRef = useRef(null)
  const mentionListRef = useRef(null)
  const cursorRef = useRef(0)

  const filteredMentions = useMemo(() => {
    const query = mentionQuery.toLowerCase()
    return user_list.filter((user) => user.toLowerCase().startsWith(query))
  }, [mentionQuery])

  const syncMentionState = (nextValue, cursor) => {
    const mention = getMentionState(nextValue, cursor)
    setMentionOpen(mention.active)
    setMentionQuery(mention.query)
    setMentionStart(mention.start)
    setActiveMentionIndex(0)
  }

  const setCursor = (position) => {
    window.requestAnimationFrame(() => {
      const el = textareaRef.current
      if (!el) return
      el.focus()
      el.setSelectionRange(position, position)
      cursorRef.current = position
    })
  }

  const handleChange = (event) => {
    const nextValue = event.target.value
    const cursor = event.target.selectionStart ?? nextValue.length
    cursorRef.current = cursor
    setValue(nextValue)
    setError('')
    syncMentionState(nextValue, cursor)
  }

  const handleSelect = () => {
    const el = textareaRef.current
    if (!el) return
    cursorRef.current = el.selectionStart ?? 0
    syncMentionState(value, cursorRef.current)
  }

  const insertText = (text, replaceFrom = null, replaceTo = null) => {
    const el = textareaRef.current
    const start = replaceFrom ?? el?.selectionStart ?? cursorRef.current
    const end = replaceTo ?? el?.selectionEnd ?? cursorRef.current
    const { nextValue, nextCursor } = insertAtCursor(value, start, end, text)

    setValue(nextValue)
    setError('')
    setCursor(nextCursor)
    syncMentionState(nextValue, nextCursor)
  }

  const insertMention = (username) => {
    if (mentionStart < 0) return
    const cursor = cursorRef.current
    insertText(`@${username} `, mentionStart, cursor)
    setMentionOpen(false)
    setMentionQuery('')
    setMentionStart(-1)
  }

  const insertEmoji = (emoji) => {
    insertText(emoji)
    setEmojiOpen(false)
  }

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed) {
      setError('Message cannot be empty')
      textareaRef.current?.focus()
      return
    }

    const sent = onSend(value)
    if (sent) {
      setValue('')
      setError('')
      setMentionOpen(false)
      setEmojiOpen(false)
      setCursor(0)
      textareaRef.current?.focus()
    }
  }

  const handleKeyDown = (event) => {
    if (mentionOpen && filteredMentions.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveMentionIndex((index) => (index + 1) % filteredMentions.length)
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveMentionIndex(
          (index) => (index - 1 + filteredMentions.length) % filteredMentions.length,
        )
        return
      }

      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault()
        insertMention(filteredMentions[activeMentionIndex])
        return
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        setMentionOpen(false)
        return
      }
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_92%,transparent)] px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="relative mx-auto w-full max-w-3xl">
        {mentionOpen && (
          <MentionDropdown
            users={filteredMentions}
            activeIndex={activeMentionIndex}
            onSelect={insertMention}
            onHover={setActiveMentionIndex}
            listRef={mentionListRef}
          />
        )}

        {emojiOpen ? (
          <EmojiPicker
            open
            onClose={() => setEmojiOpen(false)}
            onSelect={insertEmoji}
            anchorRef={emojiButtonRef}
          />
        ) : null}

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-composer)] p-2 shadow-[var(--shadow-soft)] focus-within:border-[var(--color-accent)]">
          <label htmlFor="chat-message-input" className="sr-only">
            Type a message
          </label>
          <textarea
            id="chat-message-input"
            ref={textareaRef}
            rows={2}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onSelect={handleSelect}
            onClick={handleSelect}
            onKeyUp={handleSelect}
            disabled={disabled}
            placeholder="Message the team… Use @ to mention, Shift+Enter for newline"
            className="chat-scroll max-h-40 min-h-[3.25rem] w-full resize-none bg-transparent px-2 py-2 text-sm leading-relaxed text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-subtle)]"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'chat-input-error' : 'chat-input-hint'}
          />

          <div className="flex items-center justify-between gap-2 px-1 pb-1">
            <div className="flex items-center gap-1">
              <button
                ref={emojiButtonRef}
                type="button"
                onClick={() => {
                  setEmojiOpen((open) => !open)
                  setMentionOpen(false)
                }}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition ${
                  emojiOpen
                    ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]'
                }`}
                aria-label="Open emoji picker"
                aria-expanded={emojiOpen}
                aria-haspopup="dialog"
              >
                <Smile size={18} aria-hidden="true" />
              </button>
              <p id="chat-input-hint" className="hidden text-xs text-[var(--color-text-subtle)] sm:block">
                Enter to send · Shift+Enter for newline
              </p>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={disabled || !value.trim()}
              className="inline-flex h-9 items-center gap-2 rounded-full bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-45"
              aria-label="Send message"
            >
              <SendHorizontal size={16} aria-hidden="true" />
              Send
            </button>
          </div>
        </div>

        {error ? (
          <p id="chat-input-error" className="mt-2 text-xs text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  )
}
