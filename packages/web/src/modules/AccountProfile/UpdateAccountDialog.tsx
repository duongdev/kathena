import { FC, useCallback, useMemo } from 'react'

import { Divider, Grid } from '@material-ui/core'
import { useSnackbar } from 'notistack'

import yup from '@kathena/libs/yup'
import { ANY } from '@kathena/types'
import {
  ApolloErrorList,
  FormDialog,
  SelectFormField,
  TextFormField,
} from '@kathena/ui'
import {
  Account,
  useUpdateAccountMutation,
  UpdateAccountInput,
} from 'graphql/generated'
import { DISPLAY_NAME_REGEX } from 'utils/validators'

export type UpdateAccountFormInput = {
  displayName?: string
  email: string
  username: string
  password: string
  verifyPassword: string
  roles: string[]
}

const validationSchema = yup.object({
  displayName: yup
    .string()
    .label('Tên hiển thị')
    .trim()
    .matches(DISPLAY_NAME_REGEX, {
      message: 'Tên hiển thị chứa các ký tự không phù hợp',
    })
    .min(2)
    .max(30)
    .notRequired(),
  password: yup.string().label('Mật khẩu mới').min(6),
  verifyPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Mật khẩu không khớp'),
  roles: yup.mixed().label('Phân quyền').required() as ANY,
})

export type UpdateAccountDialogProps = {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  account: Account
}

export const UpdateAccountDialog: FC<UpdateAccountDialogProps> = (props) => {
  const { open, onClose, onSuccess, account } = props
  const { enqueueSnackbar } = useSnackbar()
  const [updateAccount, { error }] = useUpdateAccountMutation()

  const initialValues: UpdateAccountFormInput = useMemo(
    () => ({
      displayName: account.displayName ?? '',
      email: account.email,
      username: account.username,
      roles: account.roles,

      password: '',
      verifyPassword: '',
    }),
    [account.displayName, account.email, account.username, account.roles],
  )

  const handleSubmit = useCallback(
    async (accountInput: UpdateAccountFormInput) => {
      try {
        const update: UpdateAccountInput = {
          displayName: accountInput.displayName,
          roles: accountInput.roles,
        }
        if (accountInput.password) update.password = accountInput.password

        await updateAccount({
          variables: {
            accountId: account.id,
            update,
          },
        })

        enqueueSnackbar('Đã sửa tài khoản thành công', { variant: 'success' })

        onSuccess?.()
        onClose()
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(e)
      }
    },
    [updateAccount, enqueueSnackbar, onClose, onSuccess, account.id],
  )

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      width={400}
      initialValues={initialValues}
      validationSchema={validationSchema as ANY}
      onSubmit={handleSubmit}
      submitButtonLabel="Sửa tài khoản"
    >
      <Grid container spacing={2}>
        <TextFormField
          gridItem={{ xs: 12 }}
          name="displayName"
          label="Tên hiển thị"
        />
        <TextFormField
          disabled
          gridItem={{ xs: 12 }}
          name="email"
          label="Địa chỉ email"
        />
        <TextFormField
          disabled
          gridItem={{ xs: 12 }}
          name="username"
          label="Tên đăng nhập"
        />

        <SelectFormField
          gridItem={{ xs: 12 }}
          fullWidth
          required
          multiple
          name="roles"
          label="Phân quyền"
          options={[
            { label: 'Admin', value: 'admin' },
            { label: 'Nhân viên', value: 'staff' },
            { label: 'Giáo viên', value: 'lecturer' },
            { label: 'Học viên', value: 'student' },
          ]}
        />

        <Grid item xs={12}>
          <Divider />
        </Grid>

        <TextFormField
          gridItem={{ xs: 12 }}
          name="password"
          label="Mật khẩu mới"
          type="password"
        />

        <TextFormField
          gridItem={{ xs: 12 }}
          name="verifyPassword"
          label="Nhập lại mật khẩu mới"
          type="password"
        />

        {error && <ApolloErrorList gridItem={{ xs: 12 }} error={error} />}
      </Grid>
    </FormDialog>
  )
}
