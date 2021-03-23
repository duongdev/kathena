import { DISPLAY_NAME_REGEX, USERNAME_REGEX } from './validators'

test('DISPLAY_NAME_REGEX', () => {
  expect(DISPLAY_NAME_REGEX.test('Dương Đỗ')).toBe(true)
  expect(DISPLAY_NAME_REGEX.test('Duong Do')).toBe(true)
  expect(DISPLAY_NAME_REGEX.test('Dustin')).toBe(true)
  expect(DISPLAY_NAME_REGEX.test(' dustin   do  ')).toBe(true)

  expect(DISPLAY_NAME_REGEX.test('DU2o')).toBe(false)
  expect(DISPLAY_NAME_REGEX.test('Do&')).toBe(false)
  expect(DISPLAY_NAME_REGEX.test('dustin.do')).toBe(false)
})

test('USERNAME_REGEX', () => {
  expect(USERNAME_REGEX.test('dustin')).toBe(true)
  expect(USERNAME_REGEX.test('dustin.do')).toBe(true)
  expect(USERNAME_REGEX.test('dustin.do95')).toBe(true)
  expect(USERNAME_REGEX.test('dustin.do.95_2')).toBe(true)
  expect(USERNAME_REGEX.test('2dust')).toBe(true)
  expect(USERNAME_REGEX.test('dustin..do')).toBe(false)
  expect(USERNAME_REGEX.test('dus@tin')).toBe(false)
})
