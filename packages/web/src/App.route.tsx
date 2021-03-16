import { FC, lazy } from 'react'

import { Redirect, Route, Switch } from 'react-router-dom'

import { ORG_WORKSPACE, SIGN_IN } from 'utils/path-builder'

const SignIn = lazy(
  () => import('modules/SignIn' /* webpackChunkName: "modules/SignIn" */),
)

const OrgWorkspace = lazy(
  () =>
    import(
      'modules/OrgWorkspace' /* webpackChunkName: "modules/OrgWorkspace" */
    ),
)

const AppRoute: FC = () => (
  <Switch>
    <Route path={SIGN_IN} component={SignIn} />
    <Route path={ORG_WORKSPACE} component={OrgWorkspace} />

    <Redirect to={ORG_WORKSPACE} />
  </Switch>
)

export default AppRoute
