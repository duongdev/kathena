export const removeExtraSpaces = (inputString?: string): string | undefined => {
  if (typeof inputString !== 'string') return undefined

  return inputString
    .trim()
    .replace(/\s\s+/g, ' ')
    .replace(/^\s+/, '')
    .replace(/\s+$/, '')
}

export const normalizeCodeField = (inputString: string): string => {
  return inputString.replace(/\s/g, '').toUpperCase()
}

export const stringWithoutSpecialCharacters = (
  inputString?: string,
): boolean => {
  if (inputString === undefined) return true
  const regex =
    /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$/
  return regex.test(inputString)
}

export const generateString = (length: number): string => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }

  return result
}
