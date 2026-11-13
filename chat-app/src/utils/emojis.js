export const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    label: 'Smileys',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😉',
      '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😋', '😛',
      '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
      '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😮‍💨', '🤥', '😌',
      '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🥵',
      '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕',
      '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧',
      '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓',
      '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀',
    ],
  },
  {
    id: 'gestures',
    label: 'Gestures',
    emojis: [
      '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞',
      '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍',
      '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝',
      '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂',
    ],
  },
  {
    id: 'hearts',
    label: 'Hearts',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️',
    ],
  },
  {
    id: 'objects',
    label: 'Objects',
    emojis: [
      '🔥', '⭐', '🌟', '✨', '💫', '⚡', '💥', '💢', '💯', '🎉',
      '🎊', '🎈', '🎁', '🏆', '🥇', '🎯', '🚀', '💡', '📌', '📎',
      '📝', '✅', '❌', '❓', '❗', '💬', '💭', '🗓️', '⏰', '🔔',
    ],
  },
  {
    id: 'food',
    label: 'Food',
    emojis: [
      '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒', '🍑',
      '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🍔', '🍟', '🍕', '🌭',
      '🥪', '🌮', '🌯', '🥗', '🍝', '🍜', '🍣', '🍩', '🍪', '🎂',
      '☕', '🍵', '🧃', '🥤', '🍺', '🍻', '🥂', '🍷', '🧊', '🍯',
    ],
  },
]

export const ALL_EMOJIS = EMOJI_CATEGORIES.flatMap((category) => category.emojis)

export function searchEmojis(query) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return ALL_EMOJIS

  return ALL_EMOJIS.filter((emoji) =>
    emoji.toLowerCase().includes(normalized) ||
    EMOJI_CATEGORIES.some(
      (category) =>
        category.label.toLowerCase().includes(normalized) &&
        category.emojis.includes(emoji),
    ),
  )
}
