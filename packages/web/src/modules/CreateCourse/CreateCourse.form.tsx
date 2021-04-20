import { FC, useMemo } from 'react'

import { CardContent, Grid, makeStyles } from '@material-ui/core'
import AccountAssigner from 'components/AccountAssigner'
import { useFormikContext } from 'formik'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { InfoBlock, SectionCard } from '@kathena/ui'
import { useFindAcademicSubjectByIdQuery } from 'graphql/generated'

import { CourseFormInput, courseLabels as labels } from './CreateCourse'

export type CreateCourseFormProps = {}

const CreateCourseForm: FC<CreateCourseFormProps> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const classes = useStyles(props)
  const formik = useFormikContext<CourseFormInput>()
  const params: { idSubject: string } = useParams()
  const idSubject = useMemo(() => params.idSubject, [params.idSubject])
  const { data } = useFindAcademicSubjectByIdQuery({
    variables: {
      Id: idSubject,
    },
  })
  const academicSubject = useMemo(() => data?.academicSubject, [
    data?.academicSubject,
  ])

  return (
    <Grid container spacing={DASHBOARD_SPACING}>
      <SectionCard
        maxContentHeight={false}
        gridItem={{ xs: 4 }}
        title="Thông tin môn học"
      >
        <CardContent>
          <InfoBlock label="Code">{academicSubject?.code}</InfoBlock>
          <InfoBlock label="Name">{academicSubject?.name}</InfoBlock>
          <InfoBlock label="Description">
            {academicSubject?.description}
          </InfoBlock>
        </CardContent>
      </SectionCard>
      <SectionCard
        title="Thông tin khóa học"
        maxContentHeight={false}
        gridItem={{ xs: 8 }}
      >
        <CardContent>
          <AccountAssigner
            label="Giáo viên đảm nhận"
            roles={['lecturer']}
            multiple
          />
        </CardContent>
      </SectionCard>
    </Grid>
  )
}

const useStyles = makeStyles(({ spacing }) => ({
  root: {},
  imageCard: {
    position: 'relative',
  },
  imageCardContent: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  imageError: {
    marginTop: spacing(2),
    flexShrink: 0,
    display: 'block',
  },
}))

export default CreateCourseForm
