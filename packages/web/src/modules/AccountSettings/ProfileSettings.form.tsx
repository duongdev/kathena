/* eslint-disable no-console */
import { FC, useCallback, useMemo } from 'react'

import { Divider, Grid, makeStyles } from '@material-ui/core'
import { Form, Formik, FormikHelpers } from 'formik'
import { useSnackbar } from 'notistack'

import yup from '@kathena/libs/yup'
import { ApolloErrorList, Button, TextFormField } from '@kathena/ui'
import { useAuth } from 'common/auth'
import {
  UpdateAccountInput,
  useUpdateSelfAccountMutation,
} from 'graphql/generated'
import { DISPLAY_NAME_REGEX } from 'utils/validators'

export type ProfileSettingsInput = {
  displayName: string
  email: string
  username: string
  password: string
  verifyPassword: string
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
})

export type ProfileSettingsFormProps = {}

const ProfileSettingsForm: FC<ProfileSettingsFormProps> = (props) => {
  const classes = useStyles(props)
  const { $account: account } = useAuth()
  const { enqueueSnackbar } = useSnackbar()
  const [updateAccount, { error }] = useUpdateSelfAccountMutation()

  const initialValues: ProfileSettingsInput = useMemo(
    () => ({
      displayName: account.displayName ?? '',
      email: account.email,
      username: account.username,

      password: '',
      verifyPassword: '',
    }),
    [account.displayName, account.email, account.username],
  )

  const handleUpdate = useCallback(
    async (
      values: ProfileSettingsInput,
      formikHelpers: FormikHelpers<ProfileSettingsInput>,
    ) => {
      if (values.password && values.password !== values.verifyPassword) {
        formikHelpers.setFieldError('verifyPassword', 'Mật khẩu không khớp')
        return
      }

      try {
        const update: UpdateAccountInput = {
          displayName: values.displayName,
        }

        if (values.password) update.password = values.password

        await updateAccount({
          variables: {
            accountId: account.id,
            update,
          },
        })

        enqueueSnackbar('Cập nhật thành công', { variant: 'success' })
      } catch (err) {
        //
      }
    },
    [account.id, enqueueSnackbar, updateAccount],
  )

  return (
    <div className={classes.root}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleUpdate}
      >
        {(formik) => (
          <Form>
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

              <Button
                gridItem
                variant="contained"
                color="primary"
                loading={formik.isSubmitting}
                type="submit"
                sx={{ mt: 2 }}
                backgroundColorButton="primary"
              >
                Cập nhật
              </Button>
            </Grid>
          </Form>
        )}
      </Formik>
    </div>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default ProfileSettingsForm
