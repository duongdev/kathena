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
  TEACHING_COURSE_CREATE_CLASSWORK_MATERIALS,
  TEACHING_COURSE_CREATE_CLASSWORK_ASSIGNMENT,
  TEACHING_COURSE_DETAIL_CLASSWORK_MATERIALS,
  TEACHING_COURSE_CLASSWORK_ASSIGNMENT,
  STUDYING_COURSE_DETAIL_CONTENT_CLASSWORK_ASSIGNMENTS,
  STUDYING_COURSE_DETAIL_COMMENT_CLASSWORK_ASSIGNMENTS,
  STUDYING_COURSE_CREATE_SUBMISSION_CLASSWORK_ASSIGNMENTS,
  TEACHING_COURSE_DETAIL_CLASSWORK_SUBMISSIONS,
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

const CreateClassworkMaterial = lazy(
  () =>
    import(
      'modules/TeachingCourse/Components/ClassworkMaterials/CreateClassworkMaterials'
    ) /* webpackChunkName: "modules/TeachingCourse/Components/ClassworkMaterials/CreateClassworkMaterials" */,
)
const CreateClassworkAssignment = lazy(
  () =>
    import(
      'modules/CreateClassworkAssignment'
    ) /* webpackChunkName: "modules/CreateClassworkAssignment" */,
)
const DetailClassworkMaterial = lazy(
  () =>
    import(
      'modules/TeachingCourse/Components/ClassworkMaterials/DetailClassworkMaterials'
    ) /* webpackChunkName: "modules/TeachingCourse/Components/ClassworkMaterials/DetailClassworkMaterials" */,
)
const ClassworkAssignmentDetail = lazy(
  () =>
    import(
      'modules/ClassworkAssignmentDetail'
    ) /* webpackChunkName: "modules/ClassworkAssignmentDetail" */,
)
const DetailContentClassworkAssignmentStudyingCourse = lazy(
  () =>
    import(
      'modules/StudyingCourse/Components/ClassworkAssignments/DetailTab'
    ) /* webpackChunkName: "modules/StudyingCourse/Components/ClassworkAssignments/DetailTab" */,
)
const DetailCommentClassworkAssignmentStudyingCourse = lazy(
  () =>
    import(
      'modules/StudyingCourse/Components/ClassworkAssignments/DetailTab'
    ) /* webpackChunkName: "modules/StudyingCourse/Components/ClassworkAssignments/DetailTab" */,
)
const CreateSubmissionClassworkAssignment = lazy(
  () =>
    import(
      'modules/StudyingCourse/Components/ClassworkAssignments/CreateSubmissionClassworkAssignment'
    ) /* webpackChunkName: "modules/StudyingCourse/Components/ClassworkAssignments/CreateSubmissionClassworkAssignment" */,
)
const DetailClassworkSubmission = lazy(
  () =>
    import(
      'modules/TeachingCourse/Components/ClassworkSubmissionDetail'
    ) /* webpackChunkName: "modules/TeachingCourse/Components/ClassworkSubmissionDetail" */,
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
        path={TEACHING_COURSE_CREATE_CLASSWORK_MATERIALS}
        exact
        component={CreateClassworkMaterial}
      />
      <Route
        path={TEACHING_COURSE_CREATE_CLASSWORK_ASSIGNMENT}
        exact
        component={CreateClassworkAssignment}
      />
      <Route
        path={TEACHING_COURSE_DETAIL_CLASSWORK_MATERIALS}
        exact
        component={DetailClassworkMaterial}
      />
      <Route
        path={TEACHING_COURSE_CLASSWORK_ASSIGNMENT}
        exact
        component={ClassworkAssignmentDetail}
      />
      <Route
        path={STUDYING_COURSE_DETAIL_CONTENT_CLASSWORK_ASSIGNMENTS}
        exact
        component={DetailContentClassworkAssignmentStudyingCourse}
      />
      <Route
        path={STUDYING_COURSE_DETAIL_COMMENT_CLASSWORK_ASSIGNMENTS}
        exact
        component={DetailCommentClassworkAssignmentStudyingCourse}
      />
      <Route
        path={STUDYING_COURSE_CREATE_SUBMISSION_CLASSWORK_ASSIGNMENTS}
        exact
        component={CreateSubmissionClassworkAssignment}
      />
      <Route
        path={TEACHING_COURSE_DETAIL_CLASSWORK_SUBMISSIONS}
        exact
        component={DetailClassworkSubmission}
      />
    </Switch>
  </Suspense>
)

export default OrgWorkspaceRoute
