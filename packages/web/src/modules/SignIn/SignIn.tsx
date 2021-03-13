import { FC } from 'react'

import { Typography } from '@kathena/ui'
import { Container, makeStyles } from '@material-ui/core'
import { Helmet } from 'react-helmet-async'

import SignInForm from './SignIn.form'

export type SignInProps = {}

const SignIn: FC<SignInProps> = (props) => {
  const classes = useStyles(props)

  return (
    <div className={classes.root}>
      <Helmet title="Đăng nhập" />
      <Container maxWidth="xs">
        <Typography variant="h3" marginBottom={4} align="center">
          Đăng nhập
        </Typography>

        <SignInForm />
      </Container>
    </div>
  )
}

const useStyles = makeStyles(({ palette, spacing }) => ({
  '@global': {
    body: { backgroundColor: `${palette.background.paper} !important` },
  },
  root: {
    padding: spacing(8, 0),
  },
}))

export default SignIn
