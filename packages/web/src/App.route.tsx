import { FC, lazy } from 'react'

import { Route, Switch } from 'react-router-dom'
import { SIGN_IN } from 'utils/path-builder'

const SignIn = lazy(
  () =>
    import(
      'common-modules/SignIn' /* webpackChunkName: "common-modules/SignIn" */
    ),
)

const AppRoute: FC = () => {
  return (
    <Switch>
      <Route path={SIGN_IN} component={SignIn} />
    </Switch>
  )
}

export default AppRoute
