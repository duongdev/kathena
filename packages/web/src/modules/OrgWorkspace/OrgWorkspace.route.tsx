import { FC, lazy, Suspense } from 'react'

import { Route, Switch } from 'react-router-dom'

import { Spinner } from '@kathena/ui'
import { USER_SELF_SETTINGS } from 'utils/path-builder'

const AccountSettings = lazy(
  () =>
    import(
      'modules/AccountSettings' /* webpackChunkName: "modules/AccountSettings" */
    ),
)

export type OrgWorkspaceRouteProps = {}

const OrgWorkspaceRoute: FC<OrgWorkspaceRouteProps> = () => (
  <Suspense fallback={<Spinner p={4} center />}>
    <Switch>
      <Route path={USER_SELF_SETTINGS} component={AccountSettings} />
    </Switch>
  </Suspense>
)

export default OrgWorkspaceRoute
