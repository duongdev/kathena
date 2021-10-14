import { FC } from 'react'

import { Grid, makeStyles } from '@material-ui/core'
import OrgLogo from 'components/OrgLogo'

import { APP_BAR_HEIGHT } from '@kathena/theme'
import { Link } from '@kathena/ui'
import { useAuth } from 'common/auth'
import { ORG_WORKSPACE } from 'utils/path-builder'

import AccountAvatarMenu from './AccountAvatarMenu'

export type OrgToolbarProps = {}

const OrgToolbar: FC<OrgToolbarProps> = (props) => {
  const classes = useStyles(props)
  const { $org: org } = useAuth()

  return (
    <Grid container spacing={2} alignItems="center" className={classes.root}>
      <Link
        gridItem
        to={ORG_WORKSPACE}
        title={org.name}
        className={classes.logo}
      >
        <OrgLogo orgId={org?.id} />
      </Link>

      <Grid item xs />

      <AccountAvatarMenu gridItem />
    </Grid>
  )
}

const useStyles = makeStyles(({ spacing }) => ({
  root: {},
  logo: {
    display: 'block',
    height: `calc(${APP_BAR_HEIGHT}px - ${spacing(2)})`,
    '& > img': {
      height: '100%',
    },
  },
}))

export default OrgToolbar
