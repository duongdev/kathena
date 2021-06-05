import { FC, useMemo } from 'react'

import { CardContent, Grid, Stack } from '@material-ui/core'
import FileComponent from 'components/FileComponent'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { ANY } from '@kathena/types'
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
          <Typography align="center">
            Bài tập không tồn tại hoặc đã bị xoá.
          </Typography>
        </PageContainer>
      )
    }

    return (
      <Grid container spacing={DASHBOARD_SPACING}>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 12 }}
          title={classworkAssignment.title}
          action={[<Button variant="contained">Nộp bài</Button>]}
        >
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Stack spacing={2}>
                  <InfoBlock label="Nội dung: ">
                    <div
                      // eslint-disable-next-line
                      dangerouslySetInnerHTML={{
                        __html: classworkAssignment.description as ANY,
                      }}
                    />
                  </InfoBlock>
                  <InfoBlock label="Bài tập:">
                    {classworkAssignment.attachments.length ? (
                      classworkAssignment.attachments.map((attachment) => (
                        <FileComponent key={attachment} fileId={attachment} />
                      ))
                    ) : (
                      <Typography>Không có file bài tập</Typography>
                    )}
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
