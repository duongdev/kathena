import { normalizeCodeField, removeExtraSpaces } from './string'

describe('core/utils/string', () => {
  test('removeExtraSpaces', () => {
    expect(removeExtraSpaces('abc')).toBe('abc')
    expect(removeExtraSpaces(' abc ')).toBe('abc')
    expect(removeExtraSpaces(' ab c  ')).toBe('ab c')
    expect(removeExtraSpaces(' a   b   c  ')).toBe('a b c')
  })

  test('normalizeCodeField', () => {
    expect(normalizeCodeField('abc123')).toBe('ABC123')
    expect(normalizeCodeField(' aBc123')).toBe('ABC123')
    expect(normalizeCodeField(' aBc-123')).toBe('ABC-123')
    expect(normalizeCodeField(' aBc-1  23 ')).toBe('ABC-123')
  })
})
