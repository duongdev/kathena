import { FC, useCallback, useState } from 'react'

import { ApolloError } from '@apollo/client'
import { Grid, makeStyles } from '@material-ui/core'
import { Form, Formik } from 'formik'

import { object, SchemaOf, string } from '@kathena/libs/yup'
import { ApolloErrorList, Button, Link, TextFormField } from '@kathena/ui'
import { useAuth } from 'common/auth'
import { DEFAULT_ORG_NS } from 'common/constants'
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
  const { resetPassword } = useAuth()
  const [error, setError] = useState<ApolloError>()

  const handleResetPassword = useCallback(
    async (input: ResetPasswordInput) => {
      try {
        setError(undefined)
        await resetPassword({
          orgNamespace: DEFAULT_ORG_NS,
          identity: input.identity,
        })
      } catch (resetPasswordError) {
        setError(resetPasswordError)
      }
    },
    [resetPassword],
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

            {error && <ApolloErrorList gridItem error={error} />}

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
