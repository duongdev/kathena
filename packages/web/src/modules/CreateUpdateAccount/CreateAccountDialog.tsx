import { FC, useCallback } from 'react'

import { Grid } from '@material-ui/core'
import { useSnackbar } from 'notistack'

import yup, { SchemaOf } from '@kathena/libs/yup'
import { ANY } from '@kathena/types'
import {
  Alert,
  ApolloErrorList,
  FormDialog,
  SelectFormField,
  TextFormField,
} from '@kathena/ui'
import { useCreateAccountMutation } from 'graphql/generated'
import { DISPLAY_NAME_REGEX, USERNAME_REGEX } from 'utils/validators'

export type CreateAccountInput = {
  displayName?: string
  username: string
  email: string
  roles: string[]
}

const validationSchema: SchemaOf<CreateAccountInput> = yup.object({
  displayName: yup
    .string()
    .label('Tên hiển thị')
    .trim()
    .matches(DISPLAY_NAME_REGEX, {
      message: 'Tên hiển thị chứa các ký tự không phù hợp',
    })
    .min(2)
    .max(50)
    .notRequired(),
  username: yup
    .string()
    .label('Tên đăng nhập')
    .min(3)
    .max(30)
    .matches(USERNAME_REGEX, {
      message: 'Cho phép chữ, số và dấu chấm; Bắt đầu bằng chữ',
    })
    .trim()
    .required(),
  email: yup
    .string()
    .label('Địa chỉ email')
    .trim()
    .lowercase()
    .email()
    .required(),
  roles: yup.mixed().label('Phân quyền').required() as ANY,
})

const initialValues: CreateAccountInput = {
  displayName: '',
  username: '',
  email: '',
  roles: [],
}

export type CreateAccountDialogProps = {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const CreateAccountDialog: FC<CreateAccountDialogProps> = (props) => {
  const { open, onClose, onSuccess } = props
  const { enqueueSnackbar } = useSnackbar()
  const [createAccount, { error }] = useCreateAccountMutation()

  const handleSubmit = useCallback(
    async (accountInput: CreateAccountInput) => {
      try {
        await createAccount({
          variables: {
            accountInput: {
              displayName: accountInput.displayName,
              email: accountInput.email,
              username: accountInput.username,
              roles: accountInput.roles,
            },
          },
        })

        enqueueSnackbar('Đã tạo tài khoản thành công', { variant: 'success' })

        onSuccess?.()
        onClose()
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(e)
      }
    },
    [createAccount, enqueueSnackbar, onClose, onSuccess],
  )

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      width={400}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      submitButtonLabel="Tạo tài khoản"
      backgroundButton="primary"
    >
      <Grid container spacing={2}>
        <TextFormField
          gridItem={{ xs: 12 }}
          autoFocus
          name="displayName"
          label="Tên người dùng"
          placeholder="Họ và tên"
        />
        <TextFormField
          gridItem={{ xs: 12 }}
          required
          name="email"
          label="Địa chỉ email"
          placeholder="someone@somewhere.com"
        />
        <TextFormField
          gridItem={{ xs: 12 }}
          required
          name="username"
          label="Tên đăng nhập"
          placeholder="Cho phép chữ, số và dấu chấm"
        />
        <SelectFormField
          gridItem={{ xs: 12 }}
          fullWidth
          multiple
          required
          name="roles"
          label="Phân quyền"
          options={[
            { label: 'Admin', value: 'admin' },
            { label: 'Nhân viên', value: 'staff' },
            { label: 'Giáo viên', value: 'lecturer' },
            { label: 'Học viên', value: 'student' },
          ]}
        />
        <Alert severity="info" gridItem={{ xs: 12 }}>
          Mật khẩu mặc định sẽ là địa chỉ email. Người dùng có thể thay đổi sau
          khi đăng nhập thành công.
        </Alert>

        {error && <ApolloErrorList gridItem={{ xs: 12 }} error={error} />}
      </Grid>
    </FormDialog>
  )
}
