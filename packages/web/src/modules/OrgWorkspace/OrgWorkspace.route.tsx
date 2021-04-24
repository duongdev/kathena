import { FC, lazy, Suspense } from 'react'

import { Route, Switch } from 'react-router-dom'

import { Spinner } from '@kathena/ui'
import {
  ACADEMIC_SUBJECT_LIST,
  USER_LIST,
  USER_SELF_SETTINGS,
  CREATE_ACADEMIC_SUBJECT,
  ORG_SETTINGS,
  UPDATE_ACADEMIC_SUBJECT,
  USER_PROFILE,
  ACADEMIC_SUBJECT,
  CREATE_ACADEMIC_COURSE,
} from 'utils/path-builder'

const AccountSettings = lazy(
  () =>
    import(
      'modules/AccountSettings' /* webpackChunkName: "modules/AccountSettings" */
    ),
)
const AccountProfile = lazy(() => import('modules/AccountProfile'))
const AcademicSubjectDetail = lazy(
  () => import('modules/AcademicSubjectDetail'),
)
const OrgAccountList = lazy(
  () =>
    import(
      'modules/OrgAccountList' /* webpackChunkName: "modules/OrgAccountList" */
    ),
)
const AcademicSubjectList = lazy(
  () =>
    import(
      'modules/AcademicSubjectList' /* webpackChunkName: "modules/OrgAccountList" */
    ),
)
const CreateUpdateAcademicSubject = lazy(
  () =>
    import(
      'modules/CreateUpdateAcademicSubject' /* webpackChunkName: "modules/CreateUpdateAcademicSubject" */
    ),
)
const CreateCourse = lazy(
  () =>
    import(
      'modules/CreateCourse' /* webpackChunkName: "modules/CreateCourse" */
    ),
)
const OrgSettings = lazy(
  () =>
    import('modules/OrgSettings' /* webpackChunkName: "modules/OrgSettings" */),
)
export type OrgWorkspaceRouteProps = {}

const OrgWorkspaceRoute: FC<OrgWorkspaceRouteProps> = () => (
  <Suspense fallback={<Spinner p={4} center />}>
    <Switch>
      <Route path={USER_SELF_SETTINGS} component={AccountSettings} />
      <Route path={USER_PROFILE} component={AccountProfile} />
      <Route path={ACADEMIC_SUBJECT} exact component={AcademicSubjectDetail} />
      <Route path={USER_LIST} component={OrgAccountList} />
      <Route
        path={ACADEMIC_SUBJECT_LIST}
        exact
        component={AcademicSubjectList}
      />
      <Route
        path={CREATE_ACADEMIC_SUBJECT}
        exact
        component={CreateUpdateAcademicSubject}
      />
      <Route
        path={UPDATE_ACADEMIC_SUBJECT}
        exact
        component={CreateUpdateAcademicSubject}
      />
      <Route path={CREATE_ACADEMIC_COURSE} exact component={CreateCourse} />
      <Route path={ORG_SETTINGS} exact component={OrgSettings} />
    </Switch>
  </Suspense>
)

export default OrgWorkspaceRoute
