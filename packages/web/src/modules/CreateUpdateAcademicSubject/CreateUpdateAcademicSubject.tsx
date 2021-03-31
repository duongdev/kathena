import { FC, useCallback, useMemo } from 'react'

import { makeStyles } from '@material-ui/core'
import { Formik } from 'formik'
import { useSnackbar } from 'notistack'
import { Check } from 'phosphor-react'

import yup, { SchemaOf } from '@kathena/libs/yup'
import { ANY } from '@kathena/types'
import { Button, FileItem, PageContainer } from '@kathena/ui'
import { useCreateAcademicSubjectMutation } from 'graphql/generated'
import { ACADEMIC_SUBJECT_LIST } from 'utils/path-builder'
import { ACADEMIC_SUBJECT_NAME_REGEX } from 'utils/validators'

import CreateUpdateAcademicSubjectForm from './CreateUpdateAcademicSubject.form'

export type CreateUpdateAcademicSubjectProps = {}

export type AcademicSubjectFormInput = {
  name: string
  description: string
  code: string
  image: FileItem | null
}

const labels: { [k in keyof AcademicSubjectFormInput]: string } = {
  name: 'Tên môn học',
  code: 'Mã môn học',
  description: 'Mô tả',
  image: 'Hình ảnh',
}

const validationSchema: SchemaOf<AcademicSubjectFormInput> = yup.object({
  name: yup
    .string()
    .label(labels.name)
    .trim()
    .matches(ACADEMIC_SUBJECT_NAME_REGEX, {
      message: `${labels.name} chứa các ký tự không phù hợp`,
    })
    .required(),
  description: yup.string().label(labels.description).required(),
  code: yup.string().label(labels.code).trim().uppercase().required(),
  image: yup.mixed().label(labels.image).required() as ANY,
})

const CreateUpdateAcademicSubject: FC<CreateUpdateAcademicSubjectProps> = (
  props,
) => {
  const classes = useStyles(props)
  const { enqueueSnackbar } = useSnackbar()
  const [createAcademicSubject] = useCreateAcademicSubjectMutation({
    context: { hasFileUpload: true },
  })
  const initialValues: AcademicSubjectFormInput = useMemo(
    () => ({
      name: '',
      description: '',
      code: '',
      image: null,
    }),
    [],
  )

  const handleCreateAcademicSubject = useCallback(
    async (input: AcademicSubjectFormInput) => {
      try {
        const { data } = await createAcademicSubject({
          variables: { input },
        })

        const academicSubject = data?.createAcademicSubject

        if (!academicSubject) {
          return
        }
        enqueueSnackbar('Thêm môn học thành công', { variant: 'success' })
        // eslint-disable-next-line no-console
        console.log(academicSubject)
      } catch (error) {
        enqueueSnackbar('Thêm môn học thất bại', { variant: 'error' })
        // eslint-disable-next-line no-console
        console.error(error)
      }
    },
    [createAcademicSubject, enqueueSnackbar],
  )

  const handleSubmitForm = useCallback(
    async (values: AcademicSubjectFormInput) =>
      handleCreateAcademicSubject(values),
    [handleCreateAcademicSubject],
  )

  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={initialValues}
      onSubmit={handleSubmitForm}
    >
      {(formik) => (
        <PageContainer
          title="Thêm môn học mới"
          backButtonLabel="Danh sách môn học"
          withBackButton={ACADEMIC_SUBJECT_LIST}
          actions={[
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<Check />}
              onClick={formik.submitForm}
              loading={formik.isSubmitting}
            >
              Tạo môn học
            </Button>,
          ]}
          className={classes.root}
        >
          <CreateUpdateAcademicSubjectForm />
        </PageContainer>
      )}
    </Formik>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export const academicSubjectLabels = labels

export default CreateUpdateAcademicSubject
