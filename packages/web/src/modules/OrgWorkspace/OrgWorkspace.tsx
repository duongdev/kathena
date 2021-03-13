import { FC } from 'react'

import { DashboardContainer } from '@kathena/ui'
import { makeStyles } from '@material-ui/core'

export type OrgWorkspaceProps = {}

const OrgWorkspace: FC<OrgWorkspaceProps> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const classes = useStyles(props)

  return <DashboardContainer>Kmin Org</DashboardContainer>
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default OrgWorkspace
