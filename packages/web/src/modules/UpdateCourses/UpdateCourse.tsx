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
import { useSnackbar } from 'notistack'
import { Trash, UserPlus } from 'phosphor-react'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import {
  Button,
  PageContainer,
  PageContainerSkeleton,
  SectionCard,
} from '@kathena/ui'
import {
  useCourseDetailQuery,
  useRemoveLecturersFromCourseMutation,
  useRemoveStudentsFromCourseMutation,
  FindCourseByIdDocument,
} from 'graphql/generated'

import AddLecturer from './AddLecturer'
import AddStudent from './AddStudent'

export type UpdateCourseProps = {
  idLecturer: string
}

const UpdateCourse: FC<UpdateCourseProps> = () => {
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
  const idOpenLecturer = useMemo(() => (open ? 'simple-popover' : undefined), [
    open,
  ])
  const openStu = useMemo(() => Boolean(openStudent), [openStudent])
  const idOpenStudent = useMemo(() => (open ? 'simple-popover' : undefined), [
    open,
  ])
  const course = useMemo(() => data?.findCourseById, [data])

  if (loading) {
    return <PageContainerSkeleton maxWidth="md" />
  }

  if (!course) {
    return <div>Không có khóa học nào</div>
  }

  return (
    <PageContainer
      withBackButton
      maxWidth="lg"
      subtitle={course.code}
      title={course.name}
    >
      {/* Giảng viên  start */}
      <Grid container spacing={DASHBOARD_SPACING}>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 12 }}
          title="Thông tin giảng viên"
          action={
            <>
              <Button
                startIcon={<UserPlus />}
                size="small"
                onClick={handleOpenCreateLecturer}
              />
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
                  <AccountDisplayName accountId={lecturerId} />
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
          </CardContent>
        </SectionCard>
      </Grid>
      {/* Giảng viên  end */}
      <Stack mt={2}>
        {/* Học viên  start */}
        <Grid container spacing={DASHBOARD_SPACING}>
          <SectionCard
            maxContentHeight={false}
            gridItem={{ xs: 12 }}
            title="Thông tin học viên"
            action={
              <>
                <Button
                  startIcon={<UserPlus />}
                  size="small"
                  onClick={handleOpenCreateStudent}
                />
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
                    <AccountDisplayName accountId={studentId} />
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
            </CardContent>
          </SectionCard>
        </Grid>
        {/* Học viên  end */}
      </Stack>
    </PageContainer>
  )
}
const useStyles = makeStyles({
  displayName: {
    alignItems: 'center',
  },
})

export default UpdateCourse
