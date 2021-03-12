import { FC } from 'react'

import { object, SchemaOf, string } from '@kathena/libs/yup'
import { Button, Link, TextFormField } from '@kathena/ui'
import { Box, Grid, makeStyles } from '@material-ui/core'
import { Form, Formik } from 'formik'
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
  password: string().label(labels.password).trim().required(),
})

const SignInForm: FC<SignInFormProps> = (props) => {
  const classes = useStyles(props)

  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={initialValues}
      onSubmit={console.log}
    >
      {(formik) => (
        <Form className={classes.root}>
          <Grid container spacing={3} direction="column" wrap="nowrap">
            <TextFormField
              gridItem
              autoFocus
              name="identity"
              label={labels.identity}
            />
            <TextFormField
              gridItem
              name="password"
              label={
                <Box
                  component="span"
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box component="span">{labels.password}</Box>
                  <Box component="span">
                    <Link to={RESET_PWD}>Quên mật khẩu?</Link>
                  </Box>
                </Box>
              }
              type="password"
            />

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
