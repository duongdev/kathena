import { FC } from 'react'

import { CardContent, Grid, makeStyles } from '@material-ui/core'
import AccountAssigner from 'components/AccountAssigner'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { PageContainer, SectionCard } from '@kathena/ui'
import { ACADEMIC_COURSE_LIST } from 'utils/path-builder'

export type CreateAcademicCourseProps = {}

const CreateAcademicCourse: FC<CreateAcademicCourseProps> = (props) => {
  const classes = useStyles(props)

  return (
    <PageContainer
      title="Thêm khóa học mới"
      backButtonLabel="Danh sách khóa học"
      withBackButton={ACADEMIC_COURSE_LIST}
      className={classes.root}
    >
      <Grid container spacing={DASHBOARD_SPACING}>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 4 }}
          title="Thông tin môn học"
        >
          <CardContent>Môn Học</CardContent>
        </SectionCard>
        <SectionCard
          title="Thông tin khóa học"
          maxContentHeight={false}
          gridItem={{ xs: 8 }}
        >
          <CardContent>
            <AccountAssigner label="Giáo viên đảm nhận" roles={['lecturer']} />
          </CardContent>
        </SectionCard>
      </Grid>
    </PageContainer>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default CreateAcademicCourse
