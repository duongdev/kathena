import { FC, useMemo } from 'react'

import { CardContent, Grid, Stack } from '@material-ui/core'
import CourseName from 'components/CourseName'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import {
  Button,
  InfoBlock,
  PageContainer,
  PageContainerSkeleton,
  SectionCard,
  Typography,
} from '@kathena/ui'
import { WithAuth } from 'common/auth'
import {
  Permission,
  useClassworkAssignmentDetailQuery,
} from 'graphql/generated'
import { buildPath } from 'utils/path-builder'

export type ClassworkAssignmentDetailProps = {}

const ClassworkAssignmentDetail: FC<ClassworkAssignmentDetailProps> = () => {
  const params: { id: string } = useParams()
  const id = useMemo(() => params.id, [params])
  const { data, loading } = useClassworkAssignmentDetailQuery({
    variables: { id },
  })

  const classworkAssignment = useMemo(() => data?.classworkAssignment, [data])

  if (loading && !data) {
    return <PageContainerSkeleton maxWidth="md" />
  }

  if (!classworkAssignment) {
    return (
      <PageContainer maxWidth="md">
        <Typography align="center">
          Bài tập không tồn tại hoặc đã bị xoá.
        </Typography>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      withBackButton
      maxWidth="lg"
      title={classworkAssignment.title}
      actions={[
        <Button
          variant="contained"
          link={buildPath('123', { id: classworkAssignment.id })}
        >
          Sửa bài tập
        </Button>,
      ]}
    >
      <Grid container spacing={DASHBOARD_SPACING}>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 9 }}
          title="Thông tin bài tập"
        >
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={7}>
                <Stack spacing={2}>
                  <InfoBlock label="Tiêu đề">
                    {classworkAssignment.title}
                  </InfoBlock>
                  <InfoBlock label="Khóa học">
                    <CourseName courseId={classworkAssignment.courseId} />
                  </InfoBlock>
                  <InfoBlock label="Mô tả">
                    {classworkAssignment.description}
                  </InfoBlock>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </SectionCard>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 3 }}
          title="Sinh viên đã nộp"
        >
          <CardContent>Render tại đây</CardContent>
        </SectionCard>
      </Grid>
    </PageContainer>
  )
}

const WithPermissionClassworkAssignmentDetail = () => (
  <WithAuth permission={Permission.Teaching_Course_Access}>
    <ClassworkAssignmentDetail />
  </WithAuth>
)

export default WithPermissionClassworkAssignmentDetail
