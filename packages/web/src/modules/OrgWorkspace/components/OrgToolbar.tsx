import { FC } from 'react'

import { Grid, makeStyles } from '@material-ui/core'
import OrgLogo from 'components/OrgLogo'

import { APP_BAR_HEIGHT } from '@kathena/theme'
import { Link } from '@kathena/ui'
import { ORG_WORKSPACE } from 'utils/path-builder'

export type OrgToolbarProps = {
  orgId: string
  name: string
}

const OrgToolbar: FC<OrgToolbarProps> = (props) => {
  const classes = useStyles(props)
  const { orgId, name } = props

  return (
    <Grid container spacing={2} alignItems="center" className={classes.root}>
      <Link gridItem to={ORG_WORKSPACE} title={name} className={classes.logo}>
        <OrgLogo orgId={orgId} />
      </Link>
    </Grid>
  )
}

const useStyles = makeStyles(({ spacing }) => ({
  root: {},
  logo: {
    display: 'block',
    height: `calc(${APP_BAR_HEIGHT}px - ${spacing(3)})`,
    '& > img': {
      height: '100%',
    },
  },
}))

export default OrgToolbar
