import { FC, useCallback } from 'react'

import { makeStyles } from '@material-ui/core'
import { Formik } from 'formik'
import { Check } from 'phosphor-react'

import yup, { SchemaOf } from '@kathena/libs/yup'
import { Button, PageContainer } from '@kathena/ui'
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
  startDate: yup.string().label(labels.startDate).required(),
})

const CreateCourse: FC<CreateCourseProps> = (props) => {
  const classes = useStyles(props)

  const initialValues: CourseFormInput = {
    code: '',
    name: '',
    tuitionFee: 0,
    academicSubjectId: '',
    lecturerIds: [],
    startDate: '',
  }

  const handleSubmitForm = useCallback((value) => value, [])

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
          <CreateCourseForm />
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
