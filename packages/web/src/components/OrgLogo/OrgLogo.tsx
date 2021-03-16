import { FC } from 'react'

import { Box, makeStyles } from '@material-ui/core'
import clsx from 'clsx'

export type OrgLogoProps = {
  orgId: string
  className?: string
}

const OrgLogo: FC<OrgLogoProps> = (props) => {
  const classes = useStyles(props)
  const { className } = props

  return (
    <Box
      component="img"
      src="/images/kmin-logo.png"
      alt="logo"
      className={clsx(className, classes.root)}
    />
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default OrgLogo
