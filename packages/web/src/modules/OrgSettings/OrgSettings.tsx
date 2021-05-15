import { FC } from 'react'

import { Grid, makeStyles } from '@material-ui/core'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { PageContainer } from '@kathena/ui'
import { WithAuth } from 'common/auth'
import { Permission } from 'graphql/generated'

import OrgOfficeListCard from './components/OrgOffices/OrgOfficeListCard'

export type OrgSettingsProps = {}

const OrgSettings: FC<OrgSettingsProps> = (props) => {
  const classes = useStyles(props)

  return (
    <PageContainer
      maxWidth="sm"
      title="Cài đặt tổ chức"
      className={classes.root}
    >
      <Grid container spacing={DASHBOARD_SPACING}>
        <OrgOfficeListCard gridItem={{ xs: 12 }} />
      </Grid>
    </PageContainer>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

const WithPermissionOrgSettings = () => (
  <WithAuth permission={Permission.OrgOffice_Access}>
    <OrgSettings />
  </WithAuth>
)

export default WithPermissionOrgSettings
