import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { getRandomUser } from '../utils/users'

const STORAGE_KEY = 'exactspace-chat-messages'

function createMessageId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function useChat() {
  const [messages, setMessages] = useLocalStorage(STORAGE_KEY, [])

  const sendMessage = useCallback((text) => {
    const trimmed = text.trim()
    if (!trimmed) return false

    const message = {
      id: createMessageId(),
      username: getRandomUser(),
      text: trimmed,
      likes: 0,
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, message])
    return true
  }, [setMessages])

  const likeMessage = useCallback((id) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === id
          ? { ...message, likes: message.likes + 1 }
          : message,
      ),
    )
  }, [setMessages])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [setMessages])

  return {
    messages,
    sendMessage,
    likeMessage,
    clearMessages,
  }
}
