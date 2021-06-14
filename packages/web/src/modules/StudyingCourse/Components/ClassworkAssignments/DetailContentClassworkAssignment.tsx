import { FC, useMemo } from 'react'

import { CardContent, Grid, Stack } from '@material-ui/core'
import FileComponent from 'components/FileComponent'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { ANY } from '@kathena/types'
import {
  Button,
  InfoBlock,
  Link,
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
import {
  buildPath,
  STUDYING_COURSE_CREATE_SUBMISSION_CLASSWORK_ASSIGNMENTS,
} from 'utils/path-builder'

export type DetailContentClassworkAssignmentProps = {}

const DetailContentClassworkAssignment: FC<DetailContentClassworkAssignmentProps> =
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
      <PageContainer
        title={classworkAssignment.title}
        withBackButton
        maxWidth="md"
        actions={[
          <>
            <Link
              to={buildPath(
                STUDYING_COURSE_CREATE_SUBMISSION_CLASSWORK_ASSIGNMENTS,
                {
                  id: classworkAssignment.id,
                },
              )}
            >
              <Button variant="contained">Nộp bài</Button>
            </Link>
          </>,
        ]}
      >
        <Grid container spacing={DASHBOARD_SPACING}>
          <SectionCard
            maxContentHeight={false}
            gridItem={{ xs: 12 }}
            title="Thông tin chi tiết bài tập"
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
      </PageContainer>
    )
  }

const WithPermissionDetailContentClassworkAssignment = () => (
  <WithAuth permission={Permission.Studying_Course_Access}>
    <DetailContentClassworkAssignment />
  </WithAuth>
)

export default WithPermissionDetailContentClassworkAssignment
