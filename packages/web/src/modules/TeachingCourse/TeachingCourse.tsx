import { FC, Suspense, lazy } from 'react'

import { Route, Switch, useParams } from 'react-router-dom'

import { PageContainer, Spinner } from '@kathena/ui'
import {
  buildPath,
  TEACHING_COURSE,
  TEACHING_COURSE_CLASSWORK_ASSIGNMENTS,
  TEACHING_COURSE_CLASSWORK_MATERIALS,
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
  return (
    <PageContainer title="Chi tiết khóa học" withBackButton maxWidth="lg">
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

export default TeachingCourse
