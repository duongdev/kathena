import { FC, useCallback, useMemo } from 'react'

import { CardContent, Grid, makeStyles } from '@material-ui/core'
import { Formik } from 'formik'
import { Check } from 'phosphor-react'
import { useParams } from 'react-router-dom'

import yup, { SchemaOf } from '@kathena/libs/yup'
import { DASHBOARD_SPACING } from '@kathena/theme'
import { Button, InfoBlock, PageContainer, SectionCard } from '@kathena/ui'
import { useFindAcademicSubjectByIdQuery } from 'graphql/generated'
import { ACADEMIC_COURSE_LIST } from 'utils/path-builder'

import CreateCourseForm from './CreateCourse.form'

export type CreateCourseProps = {}

export type CourseFormInput = {
  code: string
  name: string
  tuitionFee: number
  academicSubjectId: string
  lecturerIds: string[]
  startDate: string
}

const labels: { [k in keyof CourseFormInput]: string } = {
  name: 'Tên môn học',
  code: 'Mã môn học',
  tuitionFee: 'Học phí',
  academicSubjectId: 'Môn học',
  lecturerIds: 'Giảng viên',
  startDate: 'Ngày bắt đầu',
}

const validationSchema: SchemaOf<CourseFormInput> = yup.object({
  name: yup.string().label(labels.name).trim().required(),
  code: yup.string().label(labels.code).trim().uppercase().required(),
  tuitionFee: yup.number().label(labels.tuitionFee).min(0).required(),
  academicSubjectId: yup.string().label(labels.academicSubjectId).required(),
  lecturerIds: yup.array().label(labels.lecturerIds).notRequired(),
  startDate: yup.string().label(labels.startDate).default(''),
})

const CreateCourse: FC<CreateCourseProps> = (props) => {
  const classes = useStyles(props)
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

  const initialValues: CourseFormInput = {
    code: '',
    name: '',
    tuitionFee: 0,
    academicSubjectId: academicSubject?.id ?? '',
    lecturerIds: [],
    startDate: '',
  }

  const handleSubmitForm = useCallback((value) => console.log(value), [])

  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={initialValues}
      onSubmit={handleSubmitForm}
    >
      {(formik) => (
        <PageContainer
          title="Thêm khóa học mới"
          backButtonLabel="Danh sách khóa học"
          withBackButton={ACADEMIC_COURSE_LIST}
          className={classes.root}
          actions={[
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<Check />}
              onClick={formik.submitForm}
              loading={formik.isSubmitting}
            >
              Tạo khóa học
            </Button>,
          ]}
        >
          <Grid container spacing={DASHBOARD_SPACING}>
            <SectionCard
              gridItem={{ xs: 4 }}
              fullHeight={false}
              maxContentHeight={false}
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
              gridItem={{ xs: 8 }}
              maxContentHeight={false}
            >
              <CreateCourseForm />
            </SectionCard>
          </Grid>
        </PageContainer>
      )}
    </Formik>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export const courseLabels = labels

export default CreateCourse
