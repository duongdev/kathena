import { FC, lazy } from 'react'

import { Redirect, Route, Switch } from 'react-router-dom'

import { ORG_WORKSPACE, RESET_PWD, SIGN_IN, SET_PWD } from 'utils/path-builder'

const SignIn = lazy(
  () => import('modules/SignIn' /* webpackChunkName: "modules/SignIn" */),
)

const ResetPassword = lazy(
  () =>
    import(
      'modules/ResetPassword' /* webpackChunkName: "modules/ResetPassword" */
    ),
)

const SetPassword = lazy(
  () =>
    import('modules/SetPassword' /* webpackChunkName: "modules/SetPassword" */),
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
    <Route path={RESET_PWD} component={ResetPassword} />
    <Route path={SET_PWD} component={SetPassword} />
    <Route path={ORG_WORKSPACE} component={OrgWorkspace} />

    <Redirect to={ORG_WORKSPACE} />
  </Switch>
)

export default AppRoute
