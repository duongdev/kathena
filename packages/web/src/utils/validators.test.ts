import {
  DISPLAY_NAME_REGEX,
  USERNAME_REGEX,
  ORG_OFFICE_NAME_REGEX,
  ACADEMIC_SUBJECT_NAME_REGEX,
} from './validators'

test('ACADEMIC_SUBJECT_NAME_REGEX', () => {
  expect(
    ACADEMIC_SUBJECT_NAME_REGEX.test('Lập trình web Backend với PHP cơ bản'),
  ).toBe(true)
  expect(ACADEMIC_SUBJECT_NAME_REGEX.test('Lập trình web')).toBe(true)

  expect(
    ACADEMIC_SUBJECT_NAME_REGEX.test(
      'Lập trình web Back-end với PHP cơ bản - Khóa T4',
    ),
  ).toBe(false)
  expect(
    ACADEMIC_SUBJECT_NAME_REGEX.test('Lập trình web Back-end với PHP cơ bản'),
  ).toBe(false)
  expect(
    ACADEMIC_SUBJECT_NAME_REGEX.test('Lập trình web Backend với PHP cơ bản1'),
  ).toBe(false)
  expect(
    ACADEMIC_SUBJECT_NAME_REGEX.test('Lập trình web Backend với PHP cơ bản@'),
  ).toBe(false)
})

test('ORG_OFFICE_NAME_REGEX', () => {
  expect(ORG_OFFICE_NAME_REGEX.test('Kmin Quận 1')).toBe(true)
  expect(ORG_OFFICE_NAME_REGEX.test('Kmin')).toBe(true)
  expect(ORG_OFFICE_NAME_REGEX.test('Quận 1 Kmin')).toBe(true)

  expect(ORG_OFFICE_NAME_REGEX.test('Kmin@')).toBe(false)
})

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
