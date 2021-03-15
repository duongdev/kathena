import { FC } from 'react'

import { makeStyles } from '@material-ui/core'

import { DashboardContainer } from '@kathena/ui'
import { useAuth, withAuth } from 'common/auth'

export type OrgWorkspaceProps = {}

const OrgWorkspace: FC<OrgWorkspaceProps> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const classes = useStyles(props)
  const { account } = useAuth()

  return <DashboardContainer>Kmin Org {account?.username}</DashboardContainer>
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default withAuth()(OrgWorkspace)
