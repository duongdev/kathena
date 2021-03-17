import { FC, useCallback } from 'react'

import { Grid } from '@material-ui/core'
import { useSnackbar } from 'notistack'

import yup, { SchemaOf } from '@kathena/libs/yup'
import {
  Alert,
  ApolloErrorList,
  FormDialog,
  SelectFormField,
  TextFormField,
} from '@kathena/ui'
import { useCreateAccountMutation } from 'graphql/generated'

export type CreateAccountInput = {
  displayName?: string
  username: string
  email: string
  role: string
}

const validationSchema: SchemaOf<CreateAccountInput> = yup.object({
  displayName: yup.string().label('Tên hiển thị').trim().notRequired(),
  username: yup
    .string()
    .label('Tên đăng nhập')
    .matches(/^[a-z][a-z0-9_.]{3,30}$/)
    .trim()
    .required(),
  email: yup.string().label('Địa chỉ email').trim().email().required(),
  role: yup.string().label('Phân quyền').trim().required(),
})

const initialValues: CreateAccountInput = {
  displayName: '',
  username: '',
  email: '',
  role: '',
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
              roles: [accountInput.role],
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
          required
          name="role"
          label="Phân quyền"
          placeholder="Chọn phân quyền"
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
