import { Stack } from '@material-ui/core'

import yup, { SchemaOf } from '@kathena/libs/yup'
import { TextFormField } from '@kathena/ui'
import { ORG_OFFICE_NAME_REGEX, PHONE_REGEX } from 'utils/validators'

export type OrgOfficeEditorFormInput = {
  name: string
  address: string
  phone: string
}

export const labels: Record<keyof OrgOfficeEditorFormInput, string> = {
  name: 'Tên chi nhánh',
  address: 'Địa chỉ',
  phone: 'Số điện thoại',
}

export const validationSchema: SchemaOf<OrgOfficeEditorFormInput> = yup.object({
  name: yup
    .string()
    .label(labels.name)
    .trim()
    .matches(ORG_OFFICE_NAME_REGEX, {
      message: `${labels.name} chứa các ký tự không phù hợp`,
    })
    .required(),
  address: yup.string().label(labels.address).trim().required(),
  phone: yup
    .string()
    .label(labels.phone)
    .trim()
    .matches(PHONE_REGEX, {
      message: `${labels.phone} không đúng định dạng`,
    })
    .required(),
})

export const formContent = (
  <Stack spacing={2}>
    <TextFormField autoFocus label={labels.name} name="name" />
    <TextFormField label={labels.address} name="address" />
    <TextFormField label={labels.phone} name="phone" />
  </Stack>
)
