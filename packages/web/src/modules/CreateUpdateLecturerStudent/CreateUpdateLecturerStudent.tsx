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
import { Trash, UserPlus } from 'phosphor-react'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import {
  Button,
  PageContainer,
  PageContainerSkeleton,
  SectionCard,
} from '@kathena/ui'
import { useCourseDetailQuery } from 'graphql/generated'

import MenuLecturer from './MenuLecturer'
import MenuStudent from './MenuStudent'

export type CreateUpdateLecturerStudentProps = {}

const CreateUpdateLecturerStudent: FC<CreateUpdateLecturerStudentProps> = () => {
  const classes = useStyles()

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

  const handleClose = useCallback(() => {
    setAnchorEl(null)
    setOpenLecturer(null)
    setOpenStudent(null)
  }, [])

  // Xóa giảng viên start----------------------------
  // const handelDeleteLecturer = useCallback(
  //   (event: MouseEvent<HTMLButtonElement>, lecturerId) => {
  //     // console.log(event);
  //     // console.log(`id lecturerId: ${lecturerId}`)
  //   },
  //   [],
  // )
  // Xóa giảng viên end----------------------------

  const params: { id: string } = useParams()
  const courseId = useMemo(() => params.id, [params])
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [openLecturer, setOpenLecturer] = useState<HTMLButtonElement | null>(
    null,
  )
  const [openStudent, setOpenStudent] = useState<HTMLButtonElement | null>(null)

  // Mo chi tiet Lectuerer :
  const open = useMemo(() => Boolean(anchorEl), [anchorEl])
  const openLec = useMemo(() => Boolean(openLecturer), [openLecturer])
  const idOpenLecturer = useMemo(() => (open ? 'simple-popover' : undefined), [
    open,
  ])
  const openStu = useMemo(() => Boolean(openStudent), [openStudent])
  const idOpenStudent = useMemo(() => (open ? 'simple-popover' : undefined), [
    open,
  ])

  const { data, loading } = useCourseDetailQuery({
    variables: { id: courseId },
  })
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
                id={idOpenLecturer}
                open={openLec}
                anchorEl={openLecturer}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <MenuLecturer onClose={handleClose} />
              </Popover>
            </>
          }
        >
          <CardContent>
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
                    <AccountDisplayName accountId={lecturerId} />
                  </Grid>
                  <Grid item md={1}>
                    <IconButton
                    // onClick={(e) => {
                    //   handelDeleteLecturer(e, lecturerId)
                    // }}
                    >
                      <Trash />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
            </>
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
                  id={idOpenStudent}
                  open={openStu}
                  anchorEl={openStudent}
                  onClose={handleClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                  }}
                >
                  <MenuStudent onClose={handleClose} />
                </Popover>
              </>
            }
          >
            <CardContent>
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
                      <AccountDisplayName accountId={studentId} />
                    </Grid>
                    <Grid item md={1}>
                      <IconButton>
                        <Trash />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
              </>
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

export default CreateUpdateLecturerStudent
