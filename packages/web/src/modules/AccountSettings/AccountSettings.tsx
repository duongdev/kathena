import { FC } from 'react'

import { CardContent, Grid, makeStyles } from '@material-ui/core'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { PageContainer, SectionCard } from '@kathena/ui'

import ProfileSettingsForm from './ProfileSettings.form'

export type AccountSettingsProps = {}

const AccountSettings: FC<AccountSettingsProps> = (props) => {
  const classes = useStyles(props)

  return (
    <div className={classes.root}>
      <PageContainer withBackButton maxWidth="sm" title="Cài đặt tài khoản">
        <Grid container spacing={DASHBOARD_SPACING}>
          <SectionCard gridItem={{ xs: 12 }} title="Thông tin tài khoản">
            <CardContent>
              <ProfileSettingsForm />
            </CardContent>
          </SectionCard>
        </Grid>
      </PageContainer>
    </div>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default AccountSettings
