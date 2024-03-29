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
  ACADEMIC_COURSE,
  TEACHING_COURSE_CREATE_CLASSWORK_MATERIALS,
  TEACHING_COURSE_CREATE_CLASSWORK_ASSIGNMENT,
  TEACHING_COURSE_DETAIL_CLASSWORK_MATERIALS,
  TEACHING_COURSE_CLASSWORK_ASSIGNMENT,
  STUDYING_COURSE_CREATE_SUBMISSION_CLASSWORK_ASSIGNMENTS,
  TEACHING_COURSE_DETAIL_CLASSWORK_SUBMISSIONS,
  STUDYING_COURSE_DETAIL_CONTENT_CLASSWORK_ASSIGNMENTS,
  STUDYING_COURSE_DETAIL_CONTENT_CLASSWORK_MATERIALS,
  UPDATE_ACADEMIC_COURSE,
  STUDYING_COURSE_DETAIL_SUBMISSION_CLASSWORK_ASSIGNMENTS,
  TEACHING_COURSE_CREATE_QUIZ,
  TEACHING_COURSE_QUIZ,
  STUDYING_COURSE_QUIZ,
  TEACHING_COURSE_DETAIL_CLASSWORK_LESSON,
  STUDYING_COURSE_DETAIL_CLASSWORK_LESSON,
  TEACHING_COURSE_CREATE_CLASSWORK_LESSON,
  TEACHING_COURSE_QUIZSUBMIT,
  CLONE_ACADEMIC_COURSE,
} from 'utils/path-builder'

import ConversationPopupContainer from '../ConversationsPopupContainer/ConversationPopupContainer'

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
const CloneCourse = lazy(
  () =>
    import('modules/CloneCourse' /* webpackChunkName: "modules/CloneCourse" */),
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
const DetailCourse = lazy(
  () =>
    import(
      'modules/DetailCourse'
    ) /* webpackChunkName: "modules/DetailCourse" */,
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
    ) /* webpackChunkName: "modules/ClassworkAssignmentDetail/ClassworkSubmission/DetailClassworkSubmission" */,
)
const DetailContentClassworkAssignment = lazy(
  () =>
    import(
      'modules/StudyingCourse/Components/ClassworkAssignments/DetailContentClassworkAssignment'
    ) /* webpackChunkName: "modules/ClassworkAssignmentDetail/ClassworkSubmission/DetailClassworkSubmission" */,
)
const DetailContentClassworkMaterial = lazy(
  () =>
    import(
      'modules/StudyingCourse/Components/ClassworkMaterials/DetailContentClassworkMaterial'
    ) /* webpackChunkName: "modules/StudyingCourse/Components/ClassworkMaterials/DetailContentClassworkMaterial" */,
)
const UpdateCourse = lazy(
  () =>
    import(
      'modules/UpdateCourse' /* webpackChunkName: "modules/UpdateCourse" */
    ),
)
const DetailSubmissionClassworkAssignment = lazy(
  () =>
    import(
      'modules/StudyingCourse/Components/ClassworkAssignments/DetailClassworkSubmissionAssignment'
    ) /* webpackChunkName: "modules/ClassworkAssignmentDetail/ClassworkSubmission/DetailClassworkSubmissionAssignment" */,
)
const CreateQuiz = lazy(
  () =>
    import(
      'modules/TeachingCourse/Components/Quizzes/Components/CreateQuiz'
    ) /* webpackChunkName: 'modules/TeachingCourse/Components/Quizzes/Components/CreateQuiz' */,
)
const Quiz = lazy(
  () =>
    import(
      'modules/TeachingCourse/Components/Quizzes/Components/Quiz'
    ) /* webpackChunkName: 'modules/TeachingCourse/Components/Quizzes/Components/Quiz' */,
)
const QuizStudying = lazy(
  () =>
    import(
      'modules/StudyingCourse/Components/Quizzes/Components/Quiz'
    ) /* webpackChunkName: 'modules/StudyingCourse/Components/Quizzes/Components/Quiz' */,
)
const DetailClassworkLesson = lazy(
  () =>
    import(
      'modules/TeachingCourse/Components/ClassworkLessons/DetailClassworkLesson'
    ) /* webpackChunkName: 'modules/TeachingCourse/Components/ClassworkLessons/DetailClassworkLesson' */,
)
const CreateClassworkLesson = lazy(
  () =>
    import(
      'modules/TeachingCourse/Components/ClassworkLessons/CreateClassworkLesson'
    ) /* webpackChunkName: "modules/TeachingCourse/Components/ClassworkLessons/CreateClassworkLesson" */,
)
const QuizSubmitTeaching = lazy(
  () =>
    import(
      'modules/TeachingCourse/Components/Quizzes/Components/QuizSubmit'
    ) /* webpackChunkName: 'modules/TeachingCourse/Components/Quizzes/Components/QuizSubmit' */,
)
const DetailClassworkLessonStudying = lazy(
  () =>
    import(
      'modules/StudyingCourse/Components/ClassworkLessons/DetailClassworkLesson'
    ) /* webpackChunkName: 'modules/TeachingCourse/Components/ClassworkLessons/DetailClassworkLesson' */,
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
      <Route path={CLONE_ACADEMIC_COURSE} exact component={CloneCourse} />
      <Route path={ORG_SETTINGS} exact component={OrgSettings} />
      <Route path={TEACHING_COURSE_LIST} exact component={TeachingCourseList} />
      <Route path={STUDYING_COURSE_LIST} exact component={StudyingCourseList} />
      <Route path={STUDYING_COURSE} component={StudyingCourse} />
      <Route path={TEACHING_COURSE} component={TeachingCourse} />
      <Route path={ACADEMIC_COURSE} exact component={DetailCourse} />
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
        path={STUDYING_COURSE_CREATE_SUBMISSION_CLASSWORK_ASSIGNMENTS}
        exact
        component={CreateSubmissionClassworkAssignment}
      />
      <Route
        path={TEACHING_COURSE_DETAIL_CLASSWORK_SUBMISSIONS}
        exact
        component={DetailClassworkSubmission}
      />
      <Route
        path={STUDYING_COURSE_DETAIL_CONTENT_CLASSWORK_ASSIGNMENTS}
        exact
        component={DetailContentClassworkAssignment}
      />
      <Route
        path={TEACHING_COURSE_DETAIL_CLASSWORK_SUBMISSIONS}
        exact
        component={DetailClassworkSubmission}
      />
      <Route
        path={STUDYING_COURSE_DETAIL_CONTENT_CLASSWORK_MATERIALS}
        exact
        component={DetailContentClassworkMaterial}
      />
      <Route path={UPDATE_ACADEMIC_COURSE} exact component={UpdateCourse} />
      <Route
        path={STUDYING_COURSE_DETAIL_SUBMISSION_CLASSWORK_ASSIGNMENTS}
        exact
        component={DetailSubmissionClassworkAssignment}
      />
      <Route path={TEACHING_COURSE_CREATE_QUIZ} exact component={CreateQuiz} />
      <Route path={TEACHING_COURSE_QUIZ} exact component={Quiz} />
      <Route
        path={TEACHING_COURSE_QUIZSUBMIT}
        exact
        component={QuizSubmitTeaching}
      />
      <Route path={STUDYING_COURSE_QUIZ} exact component={QuizStudying} />
      <Route
        path={TEACHING_COURSE_DETAIL_CLASSWORK_LESSON}
        exact
        component={DetailClassworkLesson}
      />
      <Route
        path={TEACHING_COURSE_CREATE_CLASSWORK_LESSON}
        exact
        component={CreateClassworkLesson}
      />
      <Route
        path={STUDYING_COURSE_DETAIL_CLASSWORK_LESSON}
        exact
        component={DetailClassworkLessonStudying}
      />
    </Switch>
    <ConversationPopupContainer />
  </Suspense>
)

export default OrgWorkspaceRoute
