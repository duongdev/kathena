import { FC, Suspense, lazy } from 'react'

import { Route, Switch, useParams } from 'react-router-dom'

import { PageContainer, Spinner } from '@kathena/ui'
import { WithAuth } from 'common/auth'
import { Permission } from 'graphql/generated'
import {
  buildPath,
  STUDYING_COURSE,
  STUDYING_COURSE_CLASSWORK_ASSIGNMENTS,
  STUDYING_COURSE_CLASSWORK_MATERIALS,
} from 'utils/path-builder'

import TabMenu from './Components/TabMenu'

const General = lazy(() => import('./Components/General'))
const ClassworkAssignments = lazy(
  () => import('./Components/ClassworkAssignments'),
)
const ClassworkMaterials = lazy(() => import('./Components/ClassworkMaterials'))

export type StudyingCourseProps = {}

const StudyingCourse: FC<StudyingCourseProps> = () => {
  const params: { id: string } = useParams()
  return (
    <PageContainer title="Chi tiết khóa học" withBackButton maxWidth="lg">
      <TabMenu
        items={[
          {
            title: 'Tổng quan',
            to: buildPath(STUDYING_COURSE, { id: params.id }),
            exact: true,
          },
          {
            title: 'Bài tập',
            to: buildPath(STUDYING_COURSE_CLASSWORK_ASSIGNMENTS, {
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
        ]}
      />
      <Suspense fallback={<Spinner p={4} center />}>
        <Switch>
          <Route path={STUDYING_COURSE} exact component={General} />
          <Route
            path={STUDYING_COURSE_CLASSWORK_ASSIGNMENTS}
            exact
            component={ClassworkAssignments}
          />
          <Route
            path={STUDYING_COURSE_CLASSWORK_MATERIALS}
            exact
            component={ClassworkMaterials}
          />
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
