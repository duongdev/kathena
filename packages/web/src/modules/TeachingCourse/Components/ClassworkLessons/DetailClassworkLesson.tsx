import { FC, useMemo } from 'react'

import { CardContent, Grid, makeStyles, Stack } from '@material-ui/core'
import Rating from '@material-ui/lab/Rating'
import AccountAvatar from 'components/AccountAvatar/AccountAvatar'
import AccountDisplayName from 'components/AccountDisplayName'
import format from 'date-fns/format'
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
import { Permission, useFindLessonByIdQuery } from 'graphql/generated'

export type DetailClassworkLessonProps = {}

const DetailClassworkLesson: FC<DetailClassworkLessonProps> = (props) => {
  const classes = useStyles(props)
  const params: { id: string; courseDetailId: string } = useParams()
  const lessonId = useMemo(() => params.id, [params])
  const courseDetailId = useMemo(() => params.courseDetailId, [params])

  const { data, loading } = useFindLessonByIdQuery({
    variables: { lessonId, courseId: courseDetailId },
  })

  const classworkLesson = useMemo(() => data?.findLessonById, [data])

  if (loading && !data) {
    return <PageContainerSkeleton maxWidth="md" />
  }

  if (!classworkLesson) {
    return (
      <PageContainer maxWidth="md">
        <Typography align="center">
          Buổi học không tồn tại hoặc đã bị xoá.
        </Typography>
      </PageContainer>
    )
  }
  return (
    <div className={classes.root}>
      <PageContainer
        backButtonLabel="Danh sách buổi học"
        withBackButton
        maxWidth="lg"
        title={classworkLesson.description as ANY}
        actions={[<Button variant="contained">Sửa buổi học</Button>]}
      >
        <Grid container spacing={DASHBOARD_SPACING}>
          <Grid item xs={12} container spacing={DASHBOARD_SPACING}>
            <SectionCard
              maxContentHeight={false}
              gridItem={{ xs: 12 }}
              title="Thông tin buổi học"
            >
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item container xs={12}>
                    <Grid item xs={4}>
                      <Stack spacing={2}>
                        <InfoBlock label="Tiêu đề">
                          {classworkLesson.description}
                        </InfoBlock>
                        <InfoBlock label="Thời gian tạo tạo">
                          <Typography>
                            {format(
                              new Date(classworkLesson.createdAt),
                              'dd/MM/yyyy - h:mm a',
                            )}
                          </Typography>
                        </InfoBlock>
                      </Stack>
                    </Grid>
                    <Grid item xs={4}>
                      <Stack spacing={2}>
                        <InfoBlock label="Trạng thái">
                          {classworkLesson.publicationState}
                        </InfoBlock>
                        <InfoBlock label="Thời gian bắt đầu">
                          <Typography>
                            {format(
                              new Date(classworkLesson.startTime),
                              'dd/MM/yyyy - h:mm a',
                            )}
                          </Typography>
                        </InfoBlock>
                      </Stack>
                    </Grid>
                    <Grid item xs={4}>
                      <Stack spacing={2}>
                        <InfoBlock label="Đánh giá sao">
                          <Rating
                            name="customized-empty"
                            readOnly
                            defaultValue={classworkLesson.avgNumberOfStars}
                            precision={0.5}
                          />
                        </InfoBlock>
                        <InfoBlock label="Thời gian kêt thúc">
                          <Typography>
                            {format(
                              new Date(classworkLesson.endTime),
                              'dd/MM/yyyy - h:mm a',
                            )}
                          </Typography>
                        </InfoBlock>
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </SectionCard>
            <SectionCard
              maxContentHeight={false}
              gridItem={{ xs: 12 }}
              title="Danh sách sinh viên vắng mặt"
              action={
                <Typography align="left" style={{ paddingRight: '1em' }}>
                  Số lượng vắng: {classworkLesson.absentStudentIds.length}
                </Typography>
              }
            >
              <CardContent>
                {classworkLesson.absentStudentIds.length ? (
                  classworkLesson.absentStudentIds.map(
                    (classworkSubmission) => (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: '5px',
                        }}
                      >
                        <AccountAvatar accountId={classworkSubmission} />
                        <AccountDisplayName
                          style={{ cursor: 'pointer', paddingLeft: '0.5em' }}
                          accountId={classworkSubmission}
                        />
                      </div>
                    ),
                  )
                ) : (
                  <Typography>Không có học viên nào</Typography>
                )}
              </CardContent>
            </SectionCard>
          </Grid>
        </Grid>
      </PageContainer>
    </div>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))
const WithPermissionDetailClassworkLesson = () => (
  <WithAuth permission={Permission.Teaching_Course_Access}>
    <DetailClassworkLesson />
  </WithAuth>
)
export default WithPermissionDetailClassworkLesson
