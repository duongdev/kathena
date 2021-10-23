import { FC, useMemo } from 'react'

import { CardContent, Grid, makeStyles, Stack } from '@material-ui/core'
import Rating from '@material-ui/lab/Rating'
import AccountAvatar from 'components/AccountAvatar/AccountAvatar'
import AccountDisplayName from 'components/AccountDisplayName'
import format from 'date-fns/format'
import { useSnackbar } from 'notistack'
import { FilePlus, FileText } from 'phosphor-react'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { ANY } from '@kathena/types'
import {
  Button,
  InfoBlock,
  PageContainer,
  PageContainerSkeleton,
  SectionCard,
  Link,
  Typography,
  useDialogState,
} from '@kathena/ui'
import { RequiredPermission, WithAuth } from 'common/auth'
import {
  FindLessonByIdDocument,
  Permission,
  Publication,
  useFindLessonByIdQuery,
  useUpdateLessonMutation,
} from 'graphql/generated'
import {
  buildPath,
  TEACHING_COURSE_DETAIL_CLASSWORK_MATERIALS,
  TEACHING_COURSE_CLASSWORK_ASSIGNMENT,
} from 'utils/path-builder'

import AddClassworkAssignmentListAfterClass from './AddRemoveAssignmentMaterialToLesson/AddClassworkAssignmentListAfterClass'
import AddClassworkAssignmentListBeforeClass from './AddRemoveAssignmentMaterialToLesson/AddClassworkAssignmentListBeforeClass'
import AddClassworkAssignmentListInClass from './AddRemoveAssignmentMaterialToLesson/AddClassworkAssignmentListInClass'
import AddClassworkMaterialListAfterClass from './AddRemoveAssignmentMaterialToLesson/AddClassworkMaterialListAfterClass'
import AddClassworkMaterialListBeforeClass from './AddRemoveAssignmentMaterialToLesson/AddClassworkMaterialListBeforeClass'
import AddClassworkMaterialListInClass from './AddRemoveAssignmentMaterialToLesson/AddClassworkMaterialListInClass'
import Attendance from './Attendance'
import AssignmentDisplayName from './LessonDisplayName/AssignmentDisplayName'
import MaterialDisplayName from './LessonDisplayName/MaterialDisplayName'
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

  // Thêm bài tập trước/ trong/ sau buổi học
  // Trước
  const [
    addClassworkAssignmentListBeforeClass,
    handleOpenAddClassworkAssignmentListBeforeClass,
    handleCloseAddClassworkAssignmentListBeforeClass,
  ] = useDialogState()
  // Trong
  const [
    addClassworkAssignmentListInClass,
    handleOpenAddClassworkAssignmentListInClass,
    handleCloseAddClassworkAssignmentListInClass,
  ] = useDialogState()
  // Sau
  const [
    addClassworkAssignmentListAfterClass,
    handleOpenAddClassworkAssignmentListAfterClass,
    handleCloseAddClassworkAssignmentListAfterClass,
  ] = useDialogState()

  // Thêm tài liệu trước/ trong/ sau buổi học
  // Trước
  const [
    addClassworkMaterialListBeforeClass,
    handleOpenAddClassworkMaterialListBeforeClass,
    handleCloseAddClassworkMaterialListBeforeClass,
  ] = useDialogState()
  // Trong
  const [
    addClassworkMaterialListInClass,
    handleOpenAddClassworkMaterialListInClass,
    handleCloseAddClassworkMaterialListInClass,
  ] = useDialogState()
  // Sau
  const [
    addClassworkMaterialListAfterClass,
    handleOpenAddClassworkMaterialListAfterClass,
    handleCloseAddClassworkMaterialListAfterClass,
  ] = useDialogState()

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
      enqueueSnackbar(
        `Cập nhật thành ${
          classworkLesson.publicationState === Publication.Draft
            ? 'bản công khai'
            : 'bản nháp'
        }`,
        { variant: 'success' },
      )
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
            backgroundColorButton="primary"
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
              ? 'Bản nháp'
              : 'Công khai'}
          </Button>,
          <Button
            backgroundColorButton="primary"
            onClick={handleOpenAttendance}
            variant="contained"
          >
            Điểm danh
          </Button>,
          <Button
            backgroundColorButton="primary"
            onClick={handleOpenUpdateDialog}
            variant="contained"
          >
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
        {/* Điểm danh */}
        <Attendance
          lesson={classworkLesson}
          idCourse={classworkLesson.courseId}
          open={attendanceOpen}
          onClose={handleCloseAttendance}
        />
        {/* Modal Thêm bài tập trước buổi học */}
        <AddClassworkAssignmentListBeforeClass
          lesson={classworkLesson}
          idCourse={classworkLesson.courseId}
          open={addClassworkAssignmentListBeforeClass}
          onClose={handleCloseAddClassworkAssignmentListBeforeClass}
        />
        {/* Modal Thêm bài tập trong buổi học */}
        <AddClassworkAssignmentListInClass
          lesson={classworkLesson}
          idCourse={classworkLesson.courseId}
          open={addClassworkAssignmentListInClass}
          onClose={handleCloseAddClassworkAssignmentListInClass}
        />

        {/* Modal Thêm bài tập sau buổi học */}
        <AddClassworkAssignmentListAfterClass
          lesson={classworkLesson}
          idCourse={classworkLesson.courseId}
          open={addClassworkAssignmentListAfterClass}
          onClose={handleCloseAddClassworkAssignmentListAfterClass}
        />
        <AddClassworkMaterialListBeforeClass
          lesson={classworkLesson}
          idCourse={classworkLesson.courseId}
          open={addClassworkMaterialListBeforeClass}
          onClose={handleCloseAddClassworkMaterialListBeforeClass}
        />
        <AddClassworkMaterialListInClass
          lesson={classworkLesson}
          idCourse={classworkLesson.courseId}
          open={addClassworkMaterialListInClass}
          onClose={handleCloseAddClassworkMaterialListInClass}
        />
        <AddClassworkMaterialListAfterClass
          lesson={classworkLesson}
          idCourse={classworkLesson.courseId}
          open={addClassworkMaterialListAfterClass}
          onClose={handleCloseAddClassworkMaterialListAfterClass}
        />

        <Grid container spacing={DASHBOARD_SPACING}>
          {/* Thông tin buổi học */}
          <Grid container item xs={9} spacing={2}>
            <SectionCard
              maxContentHeight={false}
              gridItem={{ xs: 12, md: 12 }}
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
            {/* Trước buổi học */}
            <SectionCard
              maxContentHeight={false}
              gridItem={{ xs: 12, md: 12 }}
              title="Thông tin trước buổi học"
            >
              <CardContent>
                {/* Danh sách tài liệu trước buổi học */}
                <Grid item xs={12}>
                  <Stack spacing={2} style={{ display: 'flex' }}>
                    <Grid
                      item
                      container
                      xs={12}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Grid item xs={11}>
                        <Typography variant="subtitle2">
                          Danh sách tài liệu
                        </Typography>
                      </Grid>
                      <RequiredPermission
                        permission={
                          Permission.Classwork_UpdateClassworkMaterial
                        }
                      >
                        <Grid item xs={1}>
                          <Button
                            className={classes.buttonTextColor}
                            endIcon={<FileText />}
                            onClick={
                              handleOpenAddClassworkMaterialListBeforeClass
                            }
                          >
                            Thêm
                          </Button>
                        </Grid>
                      </RequiredPermission>
                    </Grid>
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <CardContent>
                    {classworkLesson.classworkMaterialListBeforeClass?.length
                      ? classworkLesson.classworkMaterialListBeforeClass.map(
                          (classworkMaterialListBeforeClass) => (
                            <>
                              <Link
                                to={buildPath(
                                  TEACHING_COURSE_DETAIL_CLASSWORK_MATERIALS,
                                  {
                                    id: classworkMaterialListBeforeClass,
                                  },
                                )}
                              >
                                <MaterialDisplayName
                                  materialId={classworkMaterialListBeforeClass}
                                />
                              </Link>
                            </>
                          ),
                        )
                      : 'Không có tài liệu'}
                  </CardContent>
                </Grid>
                {/* Danh sách bài tập trước buổi học */}
                <Grid item xs={12}>
                  <Stack spacing={2} style={{ display: 'flex' }}>
                    <Grid
                      item
                      container
                      xs={12}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Grid item xs={11}>
                        <Typography variant="subtitle2">
                          Danh sách bài tập
                        </Typography>
                      </Grid>
                      <RequiredPermission
                        permission={
                          Permission.Classwork_UpdateClassworkMaterial
                        }
                      >
                        <Grid item xs={1}>
                          <Button
                            className={classes.buttonTextColor}
                            endIcon={<FilePlus />}
                            onClick={
                              handleOpenAddClassworkAssignmentListBeforeClass
                            }
                          >
                            Thêm
                          </Button>
                        </Grid>
                      </RequiredPermission>
                    </Grid>
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <CardContent>
                    {classworkLesson.classworkAssignmentListBeforeClass?.length
                      ? classworkLesson.classworkAssignmentListBeforeClass.map(
                          (classworkAssignmentListBeforeClass) => (
                            <>
                              <Link
                                to={buildPath(
                                  TEACHING_COURSE_CLASSWORK_ASSIGNMENT,
                                  {
                                    id: classworkAssignmentListBeforeClass,
                                  },
                                )}
                              >
                                <AssignmentDisplayName
                                  assignmentId={
                                    classworkAssignmentListBeforeClass
                                  }
                                />
                              </Link>
                            </>
                          ),
                        )
                      : 'Không có bài tập'}
                  </CardContent>
                </Grid>
              </CardContent>
            </SectionCard>
            {/* Thông tin trong buổi học */}
            <SectionCard
              maxContentHeight={false}
              gridItem={{ xs: 12, md: 12 }}
              title="Thông tin trong buổi học"
            >
              <CardContent>
                {/* Danh sách tài liệu trong buổi học */}
                <Grid item xs={12}>
                  <Stack spacing={2} style={{ display: 'flex' }}>
                    <Grid
                      item
                      container
                      xs={12}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Grid item xs={11}>
                        <Typography variant="subtitle2">
                          Danh sách tài liệu
                        </Typography>
                      </Grid>
                      <RequiredPermission
                        permission={
                          Permission.Classwork_UpdateClassworkMaterial
                        }
                      >
                        <Grid item xs={1}>
                          <Button
                            className={classes.buttonTextColor}
                            endIcon={<FileText />}
                            onClick={handleOpenAddClassworkMaterialListInClass}
                          >
                            Thêm
                          </Button>
                        </Grid>
                      </RequiredPermission>
                    </Grid>
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <CardContent>
                    {classworkLesson.classworkMaterialListInClass?.length
                      ? classworkLesson.classworkMaterialListInClass.map(
                          (classworkLessonMaterialInClass) => (
                            <>
                              <Link
                                to={buildPath(
                                  TEACHING_COURSE_DETAIL_CLASSWORK_MATERIALS,
                                  {
                                    id: classworkLessonMaterialInClass,
                                  },
                                )}
                              >
                                <MaterialDisplayName
                                  materialId={classworkLessonMaterialInClass}
                                />
                              </Link>
                            </>
                          ),
                        )
                      : 'Không có tài liệu'}
                  </CardContent>
                </Grid>
                {/* Danh sách bài tập trong buổi học */}
                <Grid item xs={12}>
                  <Stack spacing={2} style={{ display: 'flex' }}>
                    <Grid
                      item
                      container
                      xs={12}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Grid item xs={11}>
                        <Typography variant="subtitle2">
                          Danh sách bài tập
                        </Typography>
                      </Grid>
                      <RequiredPermission
                        permission={
                          Permission.Classwork_UpdateClassworkMaterial
                        }
                      >
                        <Grid item xs={1}>
                          <Button
                            className={classes.buttonTextColor}
                            endIcon={<FilePlus />}
                            onClick={
                              handleOpenAddClassworkAssignmentListInClass
                            }
                          >
                            Thêm
                          </Button>
                        </Grid>
                      </RequiredPermission>
                    </Grid>
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <CardContent>
                    {classworkLesson.classworkAssignmentListInClass?.length
                      ? classworkLesson.classworkAssignmentListInClass.map(
                          (classworkAssignmentListInClass) => (
                            <>
                              <Link
                                to={buildPath(
                                  TEACHING_COURSE_CLASSWORK_ASSIGNMENT,
                                  {
                                    id: classworkAssignmentListInClass,
                                  },
                                )}
                              >
                                <AssignmentDisplayName
                                  assignmentId={classworkAssignmentListInClass}
                                />
                              </Link>
                            </>
                          ),
                        )
                      : 'Không có bài tập'}
                  </CardContent>
                </Grid>
              </CardContent>
            </SectionCard>
            {/* Danh sách sau buổi học */}
            <SectionCard
              maxContentHeight={false}
              gridItem={{ xs: 12, md: 12 }}
              title="Thông tin sau buổi học"
            >
              <CardContent>
                {/* Danh sách tài liệu sau buổi học */}
                <Grid item xs={12}>
                  <Stack spacing={2} style={{ display: 'flex' }}>
                    <Grid
                      item
                      container
                      xs={12}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Grid item xs={11}>
                        <Typography variant="subtitle2">
                          Danh sách tài liệu
                        </Typography>
                      </Grid>
                      <RequiredPermission
                        permission={
                          Permission.Classwork_UpdateClassworkMaterial
                        }
                      >
                        <Grid item xs={1}>
                          <Button
                            className={classes.buttonTextColor}
                            endIcon={<FileText />}
                            onClick={
                              handleOpenAddClassworkMaterialListAfterClass
                            }
                          >
                            Thêm
                          </Button>
                        </Grid>
                      </RequiredPermission>
                    </Grid>
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <CardContent>
                    {classworkLesson.classworkMaterialListAfterClass?.length
                      ? classworkLesson.classworkMaterialListAfterClass.map(
                          (classworkMaterialListAfterClass) => (
                            <>
                              <Link
                                to={buildPath(
                                  TEACHING_COURSE_DETAIL_CLASSWORK_MATERIALS,
                                  {
                                    id: classworkMaterialListAfterClass,
                                  },
                                )}
                              >
                                <MaterialDisplayName
                                  materialId={classworkMaterialListAfterClass}
                                />
                              </Link>
                            </>
                          ),
                        )
                      : 'Không có tài liệu'}
                  </CardContent>
                </Grid>
                {/* Danh sách bài tập sau buổi học */}
                <Grid item xs={12}>
                  <Stack spacing={2} style={{ display: 'flex' }}>
                    <Grid
                      item
                      container
                      xs={12}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Grid item xs={11}>
                        <Typography variant="subtitle2">
                          Danh sách bài tập
                        </Typography>
                      </Grid>
                      <RequiredPermission
                        permission={
                          Permission.Classwork_UpdateClassworkMaterial
                        }
                      >
                        <Grid item xs={1}>
                          <Button
                            className={classes.buttonTextColor}
                            endIcon={<FilePlus />}
                            onClick={
                              handleOpenAddClassworkAssignmentListAfterClass
                            }
                          >
                            Thêm
                          </Button>
                        </Grid>
                      </RequiredPermission>
                    </Grid>
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <CardContent>
                    {classworkLesson.classworkAssignmentListAfterClass?.length
                      ? classworkLesson.classworkAssignmentListAfterClass.map(
                          (classworkAssignmentListAfterClass) => (
                            <>
                              <Link
                                to={buildPath(
                                  TEACHING_COURSE_CLASSWORK_ASSIGNMENT,
                                  {
                                    id: classworkAssignmentListAfterClass,
                                  },
                                )}
                              >
                                <AssignmentDisplayName
                                  assignmentId={
                                    classworkAssignmentListAfterClass
                                  }
                                />
                              </Link>
                            </>
                          ),
                        )
                      : 'Không có bài tập'}
                  </CardContent>
                </Grid>
              </CardContent>
            </SectionCard>
          </Grid>

          {/* Thông tin học viên vắng */}
          <Grid container item xs={3}>
            <SectionCard
              fullHeight={false}
              gridItem={{ xs: 12, md: 12 }}
              title={`HV vắng mặt: ${classworkLesson.absentStudentIds.length} sv`}
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
                  <Typography>Không có học viên nào vắng</Typography>
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
  buttonTextColor: {
    color: '#992154',
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
}))
const WithPermissionDetailClassworkLesson = () => (
  <WithAuth permission={Permission.Teaching_Course_Access}>
    <DetailClassworkLesson />
  </WithAuth>
)
export default WithPermissionDetailClassworkLesson
