import { FC } from 'react'

import { Container } from '@material-ui/core'
import { Helmet } from 'react-helmet-async'

import { Alert, DashboardContainer } from '@kathena/ui'
import { useAuth, WithAuth } from 'common/auth'

import OrgSidebar from './components/OrgSidebar'
import OrgToolbar from './components/OrgToolbar'

export type OrgWorkspaceProps = {}

const OrgWorkspace: FC<OrgWorkspaceProps> = () => {
  const { org } = useAuth()

  if (!org) {
    return (
      <Container maxWidth="sm" sx={{ py: 2 }}>
        <Alert severity="error">Có lỗi xảy ra. Vui lòng thử lại</Alert>
      </Container>
    )
  }

  return (
    <DashboardContainer
      toolbar={<OrgToolbar name={org.name} orgId={org.id} />}
      sidebar={<OrgSidebar />}
    >
      <Helmet
        titleTemplate={`%s – ${org.name} | Kathena Platform`}
        defaultTitle={`${org.name} | Kathena Platform`}
      />
      Content
    </DashboardContainer>
  )
}

const OrgWorkspaceAuth = () => (
  <WithAuth>
    <OrgWorkspace />
  </WithAuth>
)

export default OrgWorkspaceAuth
