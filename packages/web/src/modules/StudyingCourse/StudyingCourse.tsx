import { FC, useMemo, useState } from 'react'

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CardContent,
  createStyles,
  Grid,
  makeStyles,
} from '@material-ui/core'
import AccountDisplayName from 'components/AccountDisplayName'
import format from 'date-fns/format'
import { CaretDown } from 'phosphor-react'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import {
  InfoBlock,
  PageContainer,
  PageContainerSkeleton,
  SectionCard,
  Typography,
} from '@kathena/ui'
import { WithAuth } from 'common/auth'
import { Permission, useCourseDetailQuery } from 'graphql/generated'

export type StudyingCourseProps = {}

const StudyingCourse: FC<StudyingCourseProps> = () => {
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
      maxWidth="md"
      title={course.name}
      subtitle={course.code}
    >
      <Grid container spacing={DASHBOARD_SPACING}>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 12 }}
          title="Thông tin khóa học"
        >
          <CardContent>
            <Grid container spacing={2}>
              <InfoBlock gridItem={{ xs: 6 }} label="Tên khóa học">
                {course.name}
              </InfoBlock>
              <InfoBlock gridItem={{ xs: 6 }} label="Mã khóa học">
                {course.code}
              </InfoBlock>
              <InfoBlock gridItem={{ xs: 6 }} label="Ngày bắt đầu">
                {format(new Date(course.startDate), 'dd/MM/yyyy')}
              </InfoBlock>
              <InfoBlock gridItem={{ xs: 6 }} label="Học phí">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(course.tuitionFee)}
              </InfoBlock>
              <InfoBlock gridItem={{ xs: 6 }} label="Giảng viên đảm nhận">
                {course.lecturerIds.map((lecturerId) => (
                  <AccountDisplayName key={lecturerId} accountId={lecturerId} />
                ))}
              </InfoBlock>
            </Grid>
          </CardContent>
          <CardContent>
            {/* Bài Tập */}
            <Accordion
              expanded={expanded === 'classworks'}
              onChange={handleChange('classworks')}
            >
              <AccordionSummary expandIcon={<CaretDown size={24} />}>
                <Typography className={classes.heading}>Bài tập</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>Bài tập sẽ render tại đây</Typography>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </SectionCard>
      </Grid>
    </PageContainer>
  )
}

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {},
    heading: {
      fontSize: theme.typography.pxToRem(15),
      flexBasis: '33.33%',
      flexShrink: 0,
    },
    secondaryHeading: {
      fontSize: theme.typography.pxToRem(15),
      color: theme.palette.text.secondary,
    },
  }),
)

const WithPermissionStudyingCourse = () => (
  <WithAuth permission={Permission.Studying_Course_Access}>
    <StudyingCourse />
  </WithAuth>
)

export default WithPermissionStudyingCourse
