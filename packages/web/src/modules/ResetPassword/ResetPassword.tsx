import { FC } from 'react'

import { Container, makeStyles } from '@material-ui/core'
import { Helmet } from 'react-helmet-async'

import { Typography } from '@kathena/ui'

import ResetPasswordForm from './ResetPassword.form'

export type ResetPasswordProps = {}

const ResetPassword: FC<ResetPasswordProps> = (props) => {
  const classes = useStyles(props)

  return (
    <div className={classes.root}>
      <Helmet title="Quên mật khẩu" />
      <Container maxWidth="xs">
        <Typography variant="h3" marginBottom={4} align="center">
          Quên mật khẩu
        </Typography>

        <ResetPasswordForm />
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

export default ResetPassword
