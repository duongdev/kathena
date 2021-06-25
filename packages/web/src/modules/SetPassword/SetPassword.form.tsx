import { FC, useCallback, useState } from 'react'

import { ApolloError } from '@apollo/client'
import { Grid, makeStyles } from '@material-ui/core'
import { Form, Formik, FormikHelpers } from 'formik'
import { useSnackbar } from 'notistack'
import { useHistory } from 'react-router-dom'

import yup from '@kathena/libs/yup'
import { ApolloErrorList, Button, Link, TextFormField } from '@kathena/ui'
import { useAuth } from 'common/auth'
import { SIGN_IN } from 'utils/path-builder'

export type ResetPasswordInput = {
  password: string
  verifyPassword: string
}

export type ResetPasswordFormProps = {
  type: string
  email: string
  otp: string
}

const initialValues: ResetPasswordInput = {
  password: '',
  verifyPassword: '',
}

const validationSchema = yup.object({
  password: yup.string().label('Mật khẩu').min(6),
  verifyPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Mật khẩu không khớp'),
})

const ResetPasswordForm: FC<ResetPasswordFormProps> = (props) => {
  const classes = useStyles(props)
  const { email, type, otp } = props
  const { setPassword } = useAuth()
  const history = useHistory()
  const { enqueueSnackbar } = useSnackbar()
  const [error, setError] = useState<ApolloError>()

  const handleResetPassword = useCallback(
    async (
      input: ResetPasswordInput,
      formikHelpers: FormikHelpers<ResetPasswordInput>,
    ) => {
      if (input.password && input.password !== input.verifyPassword) {
        formikHelpers.setFieldError('verifyPassword', 'Mật khẩu không khớp')
        return
      }
      try {
        setError(undefined)
        const account = await setPassword({
          usernameOrEmail: email,
          otp,
          password: input.password,
        })
        if (account) {
          if (type === 'ACTIVE_ACCOUNT') {
            enqueueSnackbar(
              `Bạn vừa kích hoạt tài khoản ${account.username}.`,
              { variant: 'success' },
            )
          } else if (type === 'RESET_PASSWORD') {
            enqueueSnackbar(
              `Bạn vừa đặt lại mật khẩu tài khoản ${account.username}`,
              { variant: 'success' },
            )
          }
          history.push(SIGN_IN)
        }
      } catch (resetPasswordError) {
        setError(resetPasswordError)
      }
    },
    [setPassword, email, enqueueSnackbar, history, otp, type],
  )

  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={initialValues}
      onSubmit={handleResetPassword}
    >
      {(formik) => (
        <Form className={classes.root}>
          <Grid container spacing={3} justifyContent="center">
            <TextFormField
              gridItem={{ xs: 12 }}
              name="password"
              type="password"
              disabled={formik.isSubmitting}
              label="Mật khẩu"
            />
            <TextFormField
              gridItem={{ xs: 12 }}
              name="verifyPassword"
              type="password"
              disabled={formik.isSubmitting}
              label="Nhập lại mật khẩu"
            />

            {error && <ApolloErrorList gridItem={{ xs: 12 }} error={error} />}

            <Button
              gridItem={{ xs: 12 }}
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              loading={formik.isSubmitting}
              type="submit"
            >
              Xác nhận
            </Button>
            <Link gridItem to={SIGN_IN}>
              Trở về trang đăng nhập
            </Link>
          </Grid>
        </Form>
      )}
    </Formik>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default ResetPasswordForm
