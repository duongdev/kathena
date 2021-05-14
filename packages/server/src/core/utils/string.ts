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
