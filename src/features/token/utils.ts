export function maskToken(token: string) {
  if (token.length < 16) {
    return token
  }
  const start = token.slice(0, 8)
  const end = token.slice(-8)
  return `${start}..............${end}`
}
