/* eslint-disable prefer-const */
/* eslint-disable import/no-mutable-exports */
import { ANY } from '@kathena/types'
import printValue from 'yup/lib/util/printValue'

/* eslint-disable no-template-curly-in-string */

export let mixed = {
  default: '${path} không hợp lệ',
  required: '${path} không được để trống',
  oneOf: '${path} phải là một trong các giá trị: ${values}',
  notOneOf: '${path} không thể là một trong các giá trị sau: ${values}',
  notType: ({ path, type, value, originalValue }: ANY) => {
    let isCast = originalValue != null && originalValue !== value
    let msg = `${
      `${path} must be a \`${type}\` type, ` +
      `but the final value was: \`${printValue(value, true)}\``
    }${
      isCast
        ? ` (cast from the value \`${printValue(originalValue, true)}\`).`
        : '.'
    }`

    if (value === null) {
      msg += `\n If "null" is intended as an empty value be sure to mark the schema as \`.nullable()\``
    }

    return msg
  },
}

export let string = {
  length: '${path} phải có chính xác ${length} kí tự',
  min: '${path} phải có ít nhất ${min} kí tự',
  max: '${path} chỉ có thể có tối đa ${max} kí tự',
  matches: '${path} phải thoả cú pháp: "${regex}"',
  email: '${path} phải là một email hợp lệ',
  url: '${path} phải là một URL hợp lệ',
  trim: '${path} không được có khoảng trắng ở hai đầu',
  lowercase: '${path} phải là chuỗi viết thường',
  uppercase: '${path} phải là chuỗi viết hoa',
}

export let number = {
  min: '${path} phải lớn hơn hoặc bằng ${min}',
  max: '${path} phải nhỏ hơn hoặc bằng ${max}',
  lessThan: '${path} phải nhỏ hơn ${less}',
  moreThan: '${path} phải lớn hơn ${more}',
  notEqual: '${path} không được bằng với ${notEqual}',
  positive: '${path} phải là một số dương',
  negative: '${path} phải là một số âm',
  integer: '${path} phải là một số nguyên',
}

export let date = {
  min: '${path} phải sau ngày ${min}',
  max: '${path} phải trước ngày ${max}',
}

export let boolean = {}

export let object = {
  noUnknown: '${path} field cannot have keys not specified in the object shape',
}

export let array = {
  min: '${path} phải có ít nhất ${min} phần tử',
  max: '${path} phải có tối đa ${max} phần tử',
}

export default {
  mixed,
  string,
  number,
  date,
  object,
  array,
  boolean,
}
