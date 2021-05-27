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
  ACADEMIC_COURSE_LIST,
  TEACHING_COURSE_LIST,
  STUDYING_COURSE_LIST,
  STUDYING_COURSE,
  TEACHING_COURSE,
  UPDATE_ACADEMIC_COURSE,
  TEACHING_COURSE_CREATE_CLASSWORK_ASSIGNMENT,
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
const CourseList = lazy(
  () =>
    import('modules/CourseList' /* webpackChunkName: "modules/CourseList" */),
)
const OrgSettings = lazy(
  () =>
    import('modules/OrgSettings' /* webpackChunkName: "modules/OrgSettings" */),
)
const TeachingCourseList = lazy(
  () =>
    import(
      'modules/TeachingCourseList'
    ) /* webpackChunkName: "modules/TeachingCourseList" */,
)
const StudyingCourseList = lazy(
  () =>
    import(
      'modules/StudyingCourseList'
    ) /* webpackChunkName: "modules/StudyingCourseList" */,
)
const StudyingCourse = lazy(
  () =>
    import(
      'modules/StudyingCourse'
    ) /* webpackChunkName: "modules/StudyingCourse" */,
)
const TeachingCourse = lazy(
  () =>
    import(
      'modules/TeachingCourse'
    ) /* webpackChunkName: "modules/TeachingCourse" */,
)
const UpdateCourse = lazy(
  () =>
    import(
      'modules/UpdateCourses'
    ) /* webpackChunkName: "modules/UpdateCourse" */,
)
const CreateClassworkAssignment = lazy(
  () =>
    import(
      'modules/CreateClassworkAssignment'
    ) /* webpackChunkName: "modules/CreateClassworkAssignment" */,
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
      <Route path={ACADEMIC_COURSE_LIST} exact component={CourseList} />
      <Route path={CREATE_ACADEMIC_COURSE} exact component={CreateCourse} />
      <Route path={ORG_SETTINGS} exact component={OrgSettings} />
      <Route path={TEACHING_COURSE_LIST} exact component={TeachingCourseList} />
      <Route path={STUDYING_COURSE_LIST} exact component={StudyingCourseList} />
      <Route path={STUDYING_COURSE} component={StudyingCourse} />
      <Route path={TEACHING_COURSE} component={TeachingCourse} />
      <Route path={UPDATE_ACADEMIC_COURSE} exact component={UpdateCourse} />
      <Route
        path={TEACHING_COURSE_CREATE_CLASSWORK_ASSIGNMENT}
        exact
        component={CreateClassworkAssignment}
      />
    </Switch>
  </Suspense>
)

export default OrgWorkspaceRoute
