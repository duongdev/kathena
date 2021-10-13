import { FC, MouseEvent, useCallback, useMemo, useState } from 'react'

import {
  CardContent,
  Grid,
  IconButton,
  makeStyles,
  Popover,
  Stack,
} from '@material-ui/core'
import AccountAvatar from 'components/AccountAvatar/AccountAvatar'
import AccountDisplayName from 'components/AccountDisplayName'
import { format } from 'date-fns'
import { useSnackbar } from 'notistack'
import { Pencil, Trash, UserPlus } from 'phosphor-react'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import {
  Button,
  InfoBlock,
  PageContainer,
  PageContainerSkeleton,
  SectionCard,
  Link,
} from '@kathena/ui'
import { WithAuth } from 'common/auth'
import {
  useCourseDetailQuery,
  useRemoveLecturersFromCourseMutation,
  useRemoveStudentsFromCourseMutation,
  FindCourseByIdDocument,
  Permission,
  Publication,
  useUpdateCoursePublicationByIdMutation,
} from 'graphql/generated'
import {
  buildPath,
  UPDATE_ACADEMIC_COURSE,
  ACADEMIC_COURSE_LIST,
} from 'utils/path-builder'

import AccountUserName from './AccountUserName'
import AddLecturer from './AddLecturer'
import AddStudent from './AddStudent'

export type DetailCourseProps = {}

const DetailCourse: FC<DetailCourseProps> = () => {
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const params: { id: string } = useParams()
  const courseId = useMemo(() => params.id, [params])
  const { data, loading } = useCourseDetailQuery({
    variables: { id: courseId },
  })

  // Thêm giảng viên start----------------------------
  const handleOpenCreateLecturer = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      setOpenLecturer(event.currentTarget)
    },
    [],
  )
  // Thêm giảng viên end----------------------------

  // Thêm học viên start----------------------------
  const handleOpenCreateStudent = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      setOpenStudent(event.currentTarget)
    },
    [],
  )
  // Thêm học viên end----------------------------
  // Xóa giảng viên start----------------------------
  const [deleteLecturerToCourse] = useRemoveLecturersFromCourseMutation({
    refetchQueries: [
      {
        query: FindCourseByIdDocument,
        variables: { id: courseId },
      },
    ],
  })
  const handelDeleteLecturer = useCallback(
    async (lecturerId, id) => {
      try {
        if (lecturerId === null || id === null) {
          enqueueSnackbar('Xóa thất bại', { variant: 'error' })
          return
        }
        await deleteLecturerToCourse({
          variables: {
            lecturerIds: lecturerId,
            id,
          },
        })
        enqueueSnackbar('Xóa thành công', { variant: 'success' })
        return
      } catch (error) {
        enqueueSnackbar('Xóa thất bại', { variant: 'error' })
      }
    },
    [enqueueSnackbar, deleteLecturerToCourse],
  )
  // Xóa giảng viên end----------------------------
  // Xóa học viên start----------------------------
  const [deleteStudentToCourse] = useRemoveStudentsFromCourseMutation({
    refetchQueries: [
      {
        query: FindCourseByIdDocument,
        variables: { id: courseId },
      },
    ],
  })
  const handelDeleteStudent = useCallback(
    async (student, id) => {
      try {
        if (student === null || id === null) {
          enqueueSnackbar('Xóa thất bại', { variant: 'error' })
          return
        }
        await deleteStudentToCourse({
          variables: {
            studentIds: student,
            id,
          },
        })
        enqueueSnackbar('Xóa thành công', { variant: 'success' })
        return
      } catch (error) {
        enqueueSnackbar('Xóa thất bại', { variant: 'error' })
      }
    },
    [enqueueSnackbar, deleteStudentToCourse],
  )
  // Xóa học viên end----------------------------
  const handleClose = useCallback(() => {
    setAnchorEl(null)
    setOpenLecturer(null)
    setOpenStudent(null)
  }, [])

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [openLecturer, setOpenLecturer] = useState<HTMLButtonElement | null>(
    null,
  )
  const [openStudent, setOpenStudent] = useState<HTMLButtonElement | null>(null)
  // Mở chi tiết Lecturer :
  const open = useMemo(() => Boolean(anchorEl), [anchorEl])
  const openLec = useMemo(() => Boolean(openLecturer), [openLecturer])
  const idOpenLecturer = useMemo(
    () => (open ? 'simple-popover' : undefined),
    [open],
  )
  const openStu = useMemo(() => Boolean(openStudent), [openStudent])
  const idOpenStudent = useMemo(
    () => (open ? 'simple-popover' : undefined),
    [open],
  )
  const course = useMemo(() => data?.findCourseById, [data])
  const [updateCoursePublication] = useUpdateCoursePublicationByIdMutation({
    refetchQueries: [
      {
        query: FindCourseByIdDocument,
      },
    ],
  })
  if (loading) {
    return <PageContainerSkeleton maxWidth="md" />
  }

  if (!course) {
    return <div>Không có khóa học nào</div>
  }
  const updatePublication = async (publicationState: Publication) => {
    const updated = await updateCoursePublication({
      variables: {
        courseId: course.id,
        publication: publicationState,
      },
    })
    if (updated) {
      enqueueSnackbar(
        `Cập nhật thành ${
          course.publicationState === Publication.Draft
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
    <PageContainer
      backButtonLabel="Danh sách khóa học"
      withBackButton={ACADEMIC_COURSE_LIST}
      maxWidth="lg"
      subtitle={course.code}
      title={course.name}
      actions={[
        <Button
          onClick={() =>
            updatePublication(
              course.publicationState === Publication.Draft
                ? Publication.Published
                : Publication.Draft,
            )
          }
          variant="contained"
        >
          {course.publicationState === Publication.Draft
            ? 'Bản nháp'
            : 'Công khai'}
        </Button>,
      ]}
    >
      <Grid container spacing={DASHBOARD_SPACING}>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 12 }}
          title="Thông tin khóa học"
          action={
            <Link
              to={buildPath(UPDATE_ACADEMIC_COURSE, {
                id: course.id,
              })}
              className={classes.linkButtonHover}
            >
              {' '}
              <Button className={classes.buttonTextColor} endIcon={<Pencil />}>
                Sửa khóa học
              </Button>
            </Link>
          }
        >
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Stack spacing={2}>
                  <InfoBlock label="Mã môn học">{course.code}</InfoBlock>
                  <InfoBlock label="Tên khóa học">{course.name}</InfoBlock>
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Stack spacing={2}>
                  <InfoBlock label="Ngày bắt đầu">
                    {format(new Date(course.startDate), 'MM/dd/yyyy')}
                  </InfoBlock>
                  <InfoBlock label="Học phí">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(course.tuitionFee)}
                  </InfoBlock>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </SectionCard>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 12 }}
          title="Thông tin giảng viên"
          action={
            <>
              <Button
                endIcon={<UserPlus />}
                className={classes.buttonTextColor}
                onClick={handleOpenCreateLecturer}
              >
                Thêm giảng viên
              </Button>
              <Popover
                style={{ width: '89%' }}
                id={idOpenLecturer}
                open={openLec}
                anchorEl={openLecturer}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <AddLecturer onClose={handleClose} />
              </Popover>
            </>
          }
        >
          <CardContent>
            {course.lecturerIds.length === 0 ? (
              <>Không có giảng viên</>
            ) : (
              <>
                {course.lecturerIds.map((lecturerId) => (
                  <Grid
                    container
                    spacing={2}
                    className={classes.displayName}
                    key={lecturerId}
                  >
                    <Grid item md={1}>
                      <AccountAvatar accountId={lecturerId} />
                    </Grid>
                    <Grid item md={10}>
                      <AccountDisplayName
                        accountId={lecturerId}
                        variant="body1"
                      />
                      <AccountUserName
                        variant="body2"
                        color="textSecondary"
                        accountId={lecturerId}
                      />
                    </Grid>
                    <Grid item md={1}>
                      <IconButton
                        onClick={() => {
                          handelDeleteLecturer(lecturerId, course.id)
                        }}
                      >
                        <Trash />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
              </>
            )}
          </CardContent>
        </SectionCard>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 12 }}
          title="Thông tin học viên"
          action={
            <>
              <Button
                endIcon={<UserPlus />}
                className={classes.buttonTextColor}
                onClick={handleOpenCreateStudent}
              >
                Thêm học viên
              </Button>
              <Popover
                style={{ width: '89%' }}
                id={idOpenStudent}
                open={openStu}
                anchorEl={openStudent}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <AddStudent onClose={handleClose} />
              </Popover>
            </>
          }
        >
          <CardContent>
            {course.studentIds.length === 0 ? (
              <>Không có học viên</>
            ) : (
              <>
                {course.studentIds.map((studentId) => (
                  <Grid
                    container
                    spacing={2}
                    className={classes.displayName}
                    key={studentId}
                  >
                    <Grid item md={1}>
                      <AccountAvatar accountId={studentId} />
                    </Grid>
                    <Grid item md={10}>
                      <AccountDisplayName
                        accountId={studentId}
                        variant="body1"
                      />

                      <AccountUserName
                        variant="body2"
                        color="textSecondary"
                        accountId={studentId}
                      />
                    </Grid>
                    <Grid item md={1}>
                      <IconButton
                        onClick={() => {
                          handelDeleteStudent(studentId, course.id)
                        }}
                      >
                        <Trash />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
              </>
            )}
          </CardContent>
        </SectionCard>
      </Grid>
    </PageContainer>
  )
}
const useStyles = makeStyles(({ palette }) => ({
  displayName: {
    alignItems: 'center !important',
  },
  pointer: {
    cursor: 'pointer',
  },
  buttonTextColor: {
    color: palette.semantic.yellow,
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  linkButtonHover: {
    '&:hover': {
      textDecoration: 'none',
    },
  },
}))

const WithPermissionDetailCourse = () => (
  <WithAuth permission={Permission.Academic_Course_Access}>
    <DetailCourse />
  </WithAuth>
)

export default WithPermissionDetailCourse
