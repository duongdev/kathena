import { FC, useCallback, useState } from 'react'

import { ApolloError } from '@apollo/client'
import { Grid, makeStyles } from '@material-ui/core'
import { Form, Formik } from 'formik'
import { useSnackbar } from 'notistack'
import { useHistory } from 'react-router-dom'

import { object, SchemaOf, string } from '@kathena/libs/yup'
import { ApolloErrorList, Button, Link, TextFormField } from '@kathena/ui'
import { useAuth } from 'common/auth'
import { SIGN_IN } from 'utils/path-builder'

export type ResetPasswordInput = {
  identity: string
}

export type ResetPasswordFormProps = {}

const initialValues: ResetPasswordInput = {
  identity: '',
}

const labels = {
  identity: 'Email hoặc tên đăng nhập',
}

const validationSchema: SchemaOf<ResetPasswordInput> = object({
  identity: string().label(labels.identity).trim().required(),
})

const ResetPasswordForm: FC<ResetPasswordFormProps> = (props) => {
  const classes = useStyles(props)
  const { callOTP } = useAuth()
  const { enqueueSnackbar } = useSnackbar()
  const history = useHistory()
  const [error, setError] = useState<ApolloError>()

  const handleResetPassword = useCallback(
    async (input: ResetPasswordInput) => {
      try {
        setError(undefined)
        const account = await callOTP({
          identity: input.identity,
          type: 'RESET_PASSWORD',
        })
        if (account) {
          enqueueSnackbar(
            `OTP đã được gửi cho bạn tại email ${account.email}. Vui lòng kiểm tra mail.`,
            { variant: 'success' },
          )
          history.push(SIGN_IN)
        }
      } catch (callOTPError) {
        setError(callOTPError)
      }
    },
    [callOTP, enqueueSnackbar, history],
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
              name="identity"
              disabled={formik.isSubmitting}
              label={labels.identity}
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
