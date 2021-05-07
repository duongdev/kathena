import { FC, useMemo, MouseEvent, useCallback, useState } from 'react'

import {
  CardContent,
  Grid,
  makeStyles,
  IconButton,
  Popover,
} from '@material-ui/core'
import AccountAvatar from 'components/AccountAvatar/AccountAvatar'
import AccountDisplayName from 'components/AccountDisplayName'
import { UserPlus, DotsThreeVertical } from 'phosphor-react'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import {
  Button,
  PageContainer,
  PageContainerSkeleton,
  SectionCard,
} from '@kathena/ui'
import { useCourseDetailQuery } from 'graphql/generated'

import CurrentMenu from './CurrentMenu'
import MenuLecturer from './MenuLecturer'

export type CreateUpdateLecturerStudentProps = {}

const CreateUpdateLecturerStudent: FC<CreateUpdateLecturerStudentProps> = () => {
  const classes = useStyles()
  const handleClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }, [])

  // Thêm giảng viên
  const handleOpenCreateLecturer = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      setOpenLecturer(event.currentTarget)
      // console.log(event.currentTarget)
    },
    [],
  )
  const handleClose = useCallback(() => {
    setAnchorEl(null)
    setOpenLecturer(null)
  }, [])

  const params: { id: string } = useParams()
  const courseId = useMemo(() => params.id, [params])
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [openLecturer, setOpenLecturer] = useState<HTMLButtonElement | null>(
    null,
  )

  // Mo chi tiet :
  const open = useMemo(() => Boolean(anchorEl), [anchorEl])
  const id = useMemo(() => (open ? 'simple-popover' : undefined), [open])
  const openLec = useMemo(() => Boolean(openLecturer), [openLecturer])
  const idOpenLecturer = useMemo(() => (open ? 'simple-popover' : undefined), [
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
    return <div>Course not found</div>
  }

  return (
    <PageContainer
      withBackButton
      maxWidth="lg"
      subtitle={`${`Mã khóa học : ${course.code}`}`}
      title={`${`Tên khóa học : ${course.name}`}`}
    >
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
          {/* Giảng viên */}
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
                    <IconButton size="small" onClick={handleClick}>
                      <DotsThreeVertical size={30} />
                    </IconButton>
                    <Popover
                      id={id}
                      open={open}
                      anchorEl={anchorEl}
                      onClose={handleClose}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                      }}
                    >
                      <CurrentMenu onClose={handleClose} />
                    </Popover>
                  </Grid>
                </Grid>
              ))}
            </>
          </CardContent>
        </SectionCard>
      </Grid>
    </PageContainer>
  )
}
const useStyles = makeStyles({
  displayName: {
    alignItems: 'center',
  },
})

export default CreateUpdateLecturerStudent
