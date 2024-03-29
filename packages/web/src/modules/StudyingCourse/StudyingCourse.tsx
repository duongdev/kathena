import { FC, lazy, Suspense, useMemo } from 'react'

import { Grid } from '@material-ui/core'
import { Route, Switch, useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { PageContainer, SectionCardSkeleton, Spinner } from '@kathena/ui'
import { WithAuth } from 'common/auth'
import { Permission, useCourseDetailQuery } from 'graphql/generated'
import {
  buildPath,
  STUDYING_COURSE,
  STUDYING_COURSE_LIST,
  STUDYING_COURSE_CLASSWORK_MATERIALS,
  STUDYING_COURSE_LIST_OF_SUBMITTED_ASSIGNMENTS,
  STUDYING_COURSE_CLASSWORK_LESSONS,
  STUDYING_COURSE_QUIZZES,
} from 'utils/path-builder'

import TabMenu from './Components/TabMenu'

const General = lazy(() => import('./Components/General'))

const ListOfSubmittedAssignments = lazy(
  () => import('./Components/ListOfSubmittedAssignments'),
)
const ClassworkLessons = lazy(
  () => import('./Components/ClassworkLessons/ClassworkLessons'),
)
const ClassworkMaterials = lazy(() => import('./Components/ClassworkMaterials'))
const Quizzes = lazy(() => import('./Components/Quizzes'))

export type StudyingCourseProps = {}

const StudyingCourse: FC<StudyingCourseProps> = () => {
  // Lấy thông từ param để nhận dữ liệu
  const params: { id: string } = useParams()
  const courseId = useMemo(() => params.id, [params])
  const { data, loading } = useCourseDetailQuery({
    variables: { id: courseId },
  })
  const course = useMemo(() => data?.findCourseById, [data])

  if (loading) {
    return (
      <Grid container spacing={DASHBOARD_SPACING}>
        <Grid item xs={12}>
          <SectionCardSkeleton />
        </Grid>
      </Grid>
    )
  }
  return (
    <PageContainer
      title={course?.name}
      backButtonLabel="Danh sách khóa học"
      withBackButton={STUDYING_COURSE_LIST}
      maxWidth="lg"
      subtitle={course?.code}
    >
      <TabMenu
        items={[
          {
            title: 'Tổng quan',
            to: buildPath(STUDYING_COURSE, { id: params.id }),
            exact: true,
          },
          {
            title: 'Lộ trình',
            to: buildPath(STUDYING_COURSE_CLASSWORK_LESSONS, { id: params.id }),
            exact: true,
          },
          {
            title: 'Bài tập',
            to: buildPath(STUDYING_COURSE_LIST_OF_SUBMITTED_ASSIGNMENTS, {
              id: params.id,
            }),
            exact: true,
          },
          {
            title: 'Tài liệu',
            to: buildPath(STUDYING_COURSE_CLASSWORK_MATERIALS, {
              id: params.id,
            }),
            exact: true,
          },
          {
            title: 'Thử thách câu hỏi',
            to: buildPath(STUDYING_COURSE_QUIZZES, {
              id: params.id,
            }),
            exact: true,
          },
        ]}
      />
      <Suspense fallback={<Spinner p={4} center />}>
        <Switch>
          <Route path={STUDYING_COURSE} exact component={General} />
          <Route
            path={STUDYING_COURSE_CLASSWORK_LESSONS}
            exact
            component={ClassworkLessons}
          />
          <Route
            path={STUDYING_COURSE_LIST_OF_SUBMITTED_ASSIGNMENTS}
            exact
            component={ListOfSubmittedAssignments}
          />
          <Route
            path={STUDYING_COURSE_CLASSWORK_MATERIALS}
            exact
            component={ClassworkMaterials}
          />
          <Route path={STUDYING_COURSE_QUIZZES} exact component={Quizzes} />
        </Switch>
      </Suspense>
    </PageContainer>
  )
}

const WithPermissionTeachingCourse = () => (
  <WithAuth permission={Permission.Studying_Course_Access}>
    <StudyingCourse />
  </WithAuth>
)

export default WithPermissionTeachingCourse
