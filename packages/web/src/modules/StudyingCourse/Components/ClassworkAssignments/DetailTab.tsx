import { FC, Suspense, lazy } from 'react'

import { Route, Switch, useParams } from 'react-router-dom'

import { PageContainer, Spinner } from '@kathena/ui'
import { WithAuth } from 'common/auth'
import { Permission } from 'graphql/generated'
import {
  buildPath,
  STUDYING_COURSE_DETAIL_CONTENT_CLASSWORK_ASSIGNMENTS,
  STUDYING_COURSE_DETAIL_COMMENT_CLASSWORK_ASSIGNMENTS,
} from 'utils/path-builder'

import TabMenu from '../TabMenu'

const DetailContentClassworkAssignment = lazy(
  () => import('./DetailContentClassworkAssignment'),
)

const DetailCommentClassworkAssignment = lazy(
  () => import('./DetailCommentClassworkAssignment'),
)

export type DetailTabProps = {}

const DetailTab: FC<DetailTabProps> = () => {
  const params: { id: string } = useParams()
  return (
    <PageContainer
      title="Chi tiết bài tập của bạn"
      withBackButton
      maxWidth="lg"
    >
      <TabMenu
        items={[
          {
            title: 'Nội dung',
            to: buildPath(
              STUDYING_COURSE_DETAIL_CONTENT_CLASSWORK_ASSIGNMENTS,
              {
                id: params.id,
              },
            ),
            exact: true,
          },
          {
            title: 'Nhận xét',
            to: buildPath(
              STUDYING_COURSE_DETAIL_COMMENT_CLASSWORK_ASSIGNMENTS,
              {
                id: params.id,
              },
            ),
            exact: true,
          },
        ]}
      />
      <Suspense fallback={<Spinner p={4} center />}>
        <Switch>
          <Route
            path={STUDYING_COURSE_DETAIL_CONTENT_CLASSWORK_ASSIGNMENTS}
            exact
            component={DetailContentClassworkAssignment}
          />

          <Route
            path={STUDYING_COURSE_DETAIL_COMMENT_CLASSWORK_ASSIGNMENTS}
            exact
            component={DetailCommentClassworkAssignment}
          />
        </Switch>
      </Suspense>
    </PageContainer>
  )
}

const WithPermissionDetailTab = () => (
  <WithAuth permission={Permission.Studying_Course_Access}>
    <DetailTab />
  </WithAuth>
)

export default WithPermissionDetailTab
