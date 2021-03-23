export const removeExtraSpaces = (inputString?: string): string | undefined => {
  if (typeof inputString !== 'string') return undefined

  return inputString.trim().replace(/\s\s+/g, ' ')
}
