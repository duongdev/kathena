import { FC, Suspense, lazy, useMemo } from 'react'

import { Grid } from '@material-ui/core'
import { Route, Switch, useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { PageContainer, Spinner, SectionCardSkeleton } from '@kathena/ui'
import { WithAuth } from 'common/auth'
import { Permission, useCourseDetailQuery } from 'graphql/generated'
import {
  buildPath,
  TEACHING_COURSE,
  TEACHING_COURSE_CLASSWORK_ASSIGNMENTS,
  TEACHING_COURSE_CLASSWORK_MATERIALS,
  TEACHING_COURSE_LIST,
} from 'utils/path-builder'

import TabMenu from './Components/TabMenu'

const General = lazy(() => import('./Components/General'))
const ClassworkAssignments = lazy(
  () => import('./Components/ClassworkAssignments'),
)
const ClassworkMaterials = lazy(() => import('./Components/ClassworkMaterials'))

export type TeachingCourseProps = {}

const TeachingCourse: FC<TeachingCourseProps> = () => {
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
      subtitle={course?.code}
      backButtonLabel="Danh sách khóa học"
      withBackButton={TEACHING_COURSE_LIST}
      maxWidth="lg"
    >
      <TabMenu
        items={[
          {
            title: 'Tổng quan',
            to: buildPath(TEACHING_COURSE, { id: params.id }),
            exact: true,
          },
          {
            title: 'Bài tập',
            to: buildPath(TEACHING_COURSE_CLASSWORK_ASSIGNMENTS, {
              id: params.id,
            }),
            exact: true,
          },
          {
            title: 'Tài liệu',
            to: buildPath(TEACHING_COURSE_CLASSWORK_MATERIALS, {
              id: params.id,
            }),
            exact: true,
          },
        ]}
      />
      <Suspense fallback={<Spinner p={4} center />}>
        <Switch>
          <Route path={TEACHING_COURSE} exact component={General} />
          <Route
            path={TEACHING_COURSE_CLASSWORK_ASSIGNMENTS}
            exact
            component={ClassworkAssignments}
          />
          <Route
            path={TEACHING_COURSE_CLASSWORK_MATERIALS}
            exact
            component={ClassworkMaterials}
          />
        </Switch>
      </Suspense>
    </PageContainer>
  )
}

const WithPermissionTeachingCourse = () => (
  <WithAuth permission={Permission.Teaching_Course_Access}>
    <TeachingCourse />
  </WithAuth>
)

export default WithPermissionTeachingCourse
