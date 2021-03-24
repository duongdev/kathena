export const removeExtraSpaces = (inputString?: string): string | undefined => {
  if (typeof inputString !== 'string') return undefined

  return inputString
    .trim()
    .replace(/\s\s+/g, ' ')
    .replace(/^\s+/, '')
    .replace(/\s+$/, '')
}

export const normalizeCodeField = (inputString: string): string =>
  inputString.replace(/\s/g, '').toUpperCase()
