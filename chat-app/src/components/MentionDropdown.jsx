import { getAvatarColors, getInitials } from '../utils/users'

export default function MentionDropdown({
  users,
  activeIndex,
  onSelect,
  onHover,
  listRef,
}) {
  if (!users.length) return null

  return (
    <ul
      ref={listRef}
      role="listbox"
      aria-label="Mention users"
      className="absolute bottom-[calc(100%+0.75rem)] left-0 z-30 w-56 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] py-1 shadow-[var(--shadow-panel)]"
    >
      {users.map((user, index) => {
        const colors = getAvatarColors(user)
        const isActive = index === activeIndex

        return (
          <li key={user} role="option" aria-selected={isActive}>
            <button
              type="button"
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition ${
                isActive
                  ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                  : 'text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]'
              }`}
              onMouseDown={(event) => {
                event.preventDefault()
                onSelect(user)
              }}
              onMouseEnter={() => onHover(index)}
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold"
                style={{ backgroundColor: colors.bg, color: colors.text }}
                aria-hidden="true"
              >
                {getInitials(user)}
              </span>
              <span className="font-medium">@{user}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
