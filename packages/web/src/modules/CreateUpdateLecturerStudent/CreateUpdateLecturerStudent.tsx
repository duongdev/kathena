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
import { useCourseDetailQuery } from 'graphql/generated'

import AccountInfoRow from '../TeachingCourse/AccountInfoRow'

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
      title={course.name}
      subtitle={`${`Tên khóa học${  course.code}`}`}
    >
      <Grid container spacing={DASHBOARD_SPACING}>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 12 }}
          title="Thông tin giảng viên"
        >
          {/* Giảng viên */}
          <CardContent>
            <Grid container spacing={2}>
              <InfoBlock gridItem={{ xs: 12 }} label="Giảng viên đảm nhận">
                {course.lecturerIds.map((lecturerId) => (
                  <>
                    <AccountInfoRow
                      key={lecturerId}
                      gridItem={{ xs: 4 }}
                      accountId={lecturerId}
                    />
                  </>
                ))}
              </InfoBlock>
            </Grid>
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
  }),
)

export default CreateUpdateLecturerStudent
