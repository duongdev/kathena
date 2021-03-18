import { FC, useCallback, useState } from 'react'

import { ApolloError } from '@apollo/client'
import { Box, Grid, makeStyles } from '@material-ui/core'
import { Form, Formik } from 'formik'

import { object, SchemaOf, string } from '@kathena/libs/yup'
import { ApolloErrorList, Button, Link, TextFormField } from '@kathena/ui'
import { useAuth } from 'common/auth'
import { DEFAULT_ORG_NS } from 'common/constants'
import { RESET_PWD } from 'utils/path-builder'

export type SignInInput = {
  identity: string
  password: string
}

export type SignInFormProps = {}

const initialValues: SignInInput = {
  identity: '',
  password: '',
}

const labels = {
  identity: 'Email hoặc tên đăng nhập',
  password: 'Mật khẩu',
}

const validationSchema: SchemaOf<SignInInput> = object({
  identity: string().label(labels.identity).trim().required(),
  password: string().label(labels.password).required(),
})

const SignInForm: FC<SignInFormProps> = (props) => {
  const classes = useStyles(props)
  const { signIn } = useAuth()
  const [error, setError] = useState<ApolloError>()

  const handleSignIn = useCallback(
    async (input: SignInInput) => {
      try {
        setError(undefined)
        await signIn({
          orgNamespace: DEFAULT_ORG_NS,
          identity: input.identity,
          password: input.password,
        })
      } catch (signInError) {
        setError(signInError)
      }
    },
    [signIn],
  )

  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={initialValues}
      onSubmit={handleSignIn}
    >
      {(formik) => (
        <Form className={classes.root}>
          <Grid container spacing={3} direction="column" wrap="nowrap">
            <TextFormField
              gridItem
              autoFocus
              disabled={formik.isSubmitting}
              name="identity"
              label={labels.identity}
            />
            <TextFormField
              gridItem
              name="password"
              disabled={formik.isSubmitting}
              label={
                <Box
                  component="span"
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box component="span">{labels.password}</Box>
                  <Box component="span">
                    <Link tabIndex={-1} to={RESET_PWD}>
                      Quên mật khẩu?
                    </Link>
                  </Box>
                </Box>
              }
              type="password"
            />

            {error && <ApolloErrorList gridItem error={error} />}

            <Button
              gridItem
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              loading={formik.isSubmitting}
              type="submit"
            >
              Đăng nhập
            </Button>
          </Grid>
        </Form>
      )}
    </Formik>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default SignInForm
