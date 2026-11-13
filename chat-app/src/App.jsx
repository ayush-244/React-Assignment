import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { MessagesSquare } from 'lucide-react'
import ChatHeader from './components/ChatHeader'
import ChatInput from './components/ChatInput'
import ChatMessage from './components/ChatMessage'
import { useChat } from './hooks/useChat'
import { useTheme } from './hooks/useTheme'

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const { messages, sendMessage, likeMessage, clearMessages } = useChat()
  const bottomRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--color-surface-muted)]">
      <ChatHeader
        theme={theme}
        onToggleTheme={toggleTheme}
        messageCount={messages.length}
        onClear={clearMessages}
      />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-0 sm:px-6">
        <section
          ref={listRef}
          className="chat-scroll flex-1 overflow-y-auto px-3 py-4 sm:px-0 sm:py-6"
          aria-live="polite"
          aria-relevant="additions"
          aria-label="Chat messages"
        >
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex h-full min-h-[50dvh] flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-12 text-center shadow-[var(--shadow-soft)]"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                <MessagesSquare size={28} aria-hidden="true" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                Start the conversation
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--color-text-muted)]">
                Send a message to begin. Each message is assigned a random teammate
                from Alan, Bob, Carol, Dean, or Elin. Try emojis and @mentions.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-1">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onLike={likeMessage}
                  />
                ))}
              </AnimatePresence>
              <div ref={bottomRef} aria-hidden="true" />
            </div>
          )}
        </section>
      </main>

      <ChatInput onSend={sendMessage} />
    </div>
  )
}
