export const user_list = ['Alan', 'Bob', 'Carol', 'Dean', 'Elin']

const AVATAR_COLORS = {
  Alan: { bg: '#DBEAFE', text: '#1D4ED8' },
  Bob: { bg: '#DCFCE7', text: '#15803D' },
  Carol: { bg: '#FCE7F3', text: '#BE185D' },
  Dean: { bg: '#FFEDD5', text: '#C2410C' },
  Elin: { bg: '#E0E7FF', text: '#4338CA' },
}

export function getRandomUser() {
  return user_list[Math.floor(Math.random() * user_list.length)]
}

export function getAvatarColors(username) {
  return AVATAR_COLORS[username] ?? { bg: '#E4E7EC', text: '#344054' }
}

export function getInitials(username) {
  return username.slice(0, 1).toUpperCase()
}
