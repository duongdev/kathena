import { FC, useMemo, useState } from 'react'

import { CardContent, Grid, makeStyles, IconButton } from '@material-ui/core'
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

export type CreateUpdateLecturerStudentProps = {}

const CreateUpdateLecturerStudent: FC<CreateUpdateLecturerStudentProps> = () => {
  const classes = useStyles()
  const params: { id: string } = useParams()
  const courseId = useMemo(() => params.id, [params])
  const { data, loading } = useCourseDetailQuery({
    variables: { id: courseId },
  })
  const course = useMemo(() => data?.findCourseById, [data])

  const [expanded, setExpanded] = useState<string | false>(false)

  const handleChange = (panel: string) => (
    event: React.ChangeEvent<{}>,
    isExpanded: boolean,
  ) => {
    setExpanded(isExpanded ? panel : false)
  }

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
            <Button
              startIcon={<UserPlus />}
              size="small"
              // onClick={handleOpenCreateDialog}
            />
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
                    <IconButton
                      size="small"
                      // onClick={handleClick}
                    >
                      <DotsThreeVertical size={30} />
                    </IconButton>
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
