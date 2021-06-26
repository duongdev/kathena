import { FC, useMemo } from 'react'

import { Container, makeStyles } from '@material-ui/core'
import { useSnackbar } from 'notistack'
import { Helmet } from 'react-helmet-async'
import { useHistory } from 'react-router-dom'

import { ANY } from '@kathena/types'
import { Typography, useLocationQuery } from '@kathena/ui'
import { SIGN_IN } from 'utils/path-builder'

import SetPasswordForm from './SetPassword.form'

export type SetPasswordProps = {}

const SetPassword: FC<SetPasswordProps> = (props) => {
  const classes = useStyles(props)
  const { query } = useLocationQuery()
  const { enqueueSnackbar } = useSnackbar()
  const history = useHistory()

  const { type, email, otp } = query
  if (!type || !email || !otp) {
    enqueueSnackbar('Vui lòng truy cập đúng link được cung cấp trong email.', {
      variant: 'error',
    })
    history.push(SIGN_IN)
  }
  const title = useMemo(
    () =>
      // eslint-disable-next-line
      type === 'ACTIVE_ACCOUNT'
        ? 'Kích hoạt tài khoản'
        : type === 'RESET_PASSWORD'
        ? 'Đặt lại mật khẩu'
        : '',
    [type],
  )

  return (
    <div className={classes.root}>
      <Helmet title={title} />
      <Container maxWidth="xs">
        <Typography variant="h3" marginBottom={4} align="center">
          {title}
        </Typography>

        <SetPasswordForm
          type={type as ANY}
          otp={otp as ANY}
          email={email as ANY}
        />
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

export default SetPassword
