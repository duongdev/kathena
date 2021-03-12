import { FC } from 'react'

import Typography from '@kathena/ui/Typography'
import { Container, makeStyles } from '@material-ui/core'

export type SignInProps = {}

const SignIn: FC<SignInProps> = (props) => {
  const classes = useStyles(props)

  return (
    <div className={classes.root}>
      <Container maxWidth="xs">
        <Typography variant="h3">Đăng nhập</Typography>
      </Container>
    </div>
  )
}

const useStyles = makeStyles(({ palette }) => ({
  '@global': { backgroundColor: palette.background.paper },
  root: {},
}))

export default SignIn
