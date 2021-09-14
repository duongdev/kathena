import { FC, useMemo } from 'react'

import { CardContent, Grid, makeStyles, Stack } from '@material-ui/core'
import Rating from '@material-ui/lab/Rating'
import AccountAvatar from 'components/AccountAvatar/AccountAvatar'
import AccountDisplayName from 'components/AccountDisplayName'
import format from 'date-fns/format'
import { useSnackbar } from 'notistack'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { ANY } from '@kathena/types'
import {
  Button,
  InfoBlock,
  PageContainer,
  PageContainerSkeleton,
  useDialogState,
  SectionCard,
  Typography,
} from '@kathena/ui'
import { WithAuth, RequiredPermission } from 'common/auth'
import {
  Permission,
  useFindLessonByIdQuery,
  useUpdateLessonMutation,
  FindLessonByIdDocument,
  Publication,
} from 'graphql/generated'

import Attendance from './Attendance'
import UpdateClassworkLessonDialog from './UpdateClassworkLessonDialog'

export type DetailClassworkLessonProps = {}

const DetailClassworkLesson: FC<DetailClassworkLessonProps> = (props) => {
  const classes = useStyles(props)
  const params: { id: string; courseDetailId: string } = useParams()
  const lessonId = useMemo(() => params.id, [params])
  const [updateDialogOpen, handleOpenUpdateDialog, handleCloseUpdateDialog] =
    useDialogState()
  const [attendanceOpen, handleOpenAttendance, handleCloseAttendance] =
    useDialogState()
  const { data, loading } = useFindLessonByIdQuery({
    variables: { lessonId },
  })
  const [updateLesson] = useUpdateLessonMutation({
    refetchQueries: [
      {
        query: FindLessonByIdDocument,
        variables: { lessonId },
      },
    ],
  })
  const { enqueueSnackbar } = useSnackbar()
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

  const updatePublication = async (publicationState: Publication) => {
    const updated = await updateLesson({
      variables: {
        courseId: classworkLesson.courseId,
        lessonId: classworkLesson.id,
        updateInput: {
          publicationState,
        },
      },
    })
    if (updated) {
      enqueueSnackbar(`Cập nhật thành công`, { variant: 'success' })
    } else {
      enqueueSnackbar(`Cập nhật thất bại`, { variant: 'error' })
    }
  }

  return (
    <div className={classes.root}>
      <PageContainer
        backButtonLabel="Danh sách buổi học"
        withBackButton
        maxWidth="lg"
        title={classworkLesson.description as ANY}
        actions={[
          <Button
            onClick={() =>
              updatePublication(
                classworkLesson.publicationState === Publication.Draft
                  ? Publication.Published
                  : Publication.Draft,
              )
            }
            variant="contained"
          >
            {classworkLesson.publicationState === Publication.Draft
              ? 'Public'
              : 'Draft'}
          </Button>,
          <Button onClick={handleOpenAttendance} variant="contained">
            Điểm danh
          </Button>,
          <Button onClick={handleOpenUpdateDialog} variant="contained">
            Sửa buổi học
          </Button>,
        ]}
      >
        <RequiredPermission
          permission={Permission.Classwork_UpdateClassworkMaterial}
        >
          <UpdateClassworkLessonDialog
            open={updateDialogOpen}
            onClose={handleCloseUpdateDialog}
            classworkLesson={classworkLesson as ANY}
          />
        </RequiredPermission>
        <Attendance
          lesson={classworkLesson}
          idCourse={classworkLesson.courseId}
          open={attendanceOpen}
          onClose={handleCloseAttendance}
        />
        <Grid container spacing={DASHBOARD_SPACING}>
          <SectionCard
            maxContentHeight={false}
            gridItem={{ xs: 12, md: 9 }}
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
                      <InfoBlock label="Thời gian tạo">
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
            gridItem={{ xs: 12, md: 3 }}
            title={`SV vắng mặt: ${classworkLesson.absentStudentIds.length} sv`}
          >
            <CardContent>
              {classworkLesson.absentStudentIds.length ? (
                classworkLesson.absentStudentIds.map((classworkSubmission) => (
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
                ))
              ) : (
                <Typography>Không có học viên nào vắng</Typography>
              )}
            </CardContent>
          </SectionCard>
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
