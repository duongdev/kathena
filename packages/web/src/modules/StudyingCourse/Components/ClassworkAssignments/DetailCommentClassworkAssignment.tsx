import { FC, useMemo } from 'react'

import { CardContent, Grid, Stack } from '@material-ui/core'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import {
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

export type DetailCommentClassworkAssignmentProps = {}

const DetailCommentClassworkAssignment: FC<DetailCommentClassworkAssignmentProps> =
  () => {
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
          <Typography align="center">Không có nhận xét.</Typography>
        </PageContainer>
      )
    }

    return (
      <Grid container spacing={DASHBOARD_SPACING}>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 10 }}
          title={classworkAssignment.title}
        >
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Stack spacing={2}>
                  <InfoBlock label="Điểm: ">
                    <Typography>8đ</Typography>
                  </InfoBlock>
                  <InfoBlock label="Nhận xét:">
                    <Typography>Tốt</Typography>
                  </InfoBlock>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </SectionCard>
      </Grid>
    )
  }

const WithPermissionDetailCommentClassworkAssignment = () => (
  <WithAuth permission={Permission.Studying_Course_Access}>
    <DetailCommentClassworkAssignment />
  </WithAuth>
)

export default WithPermissionDetailCommentClassworkAssignment
