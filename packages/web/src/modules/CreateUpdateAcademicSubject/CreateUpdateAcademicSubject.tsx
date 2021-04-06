import { FC, useCallback, useMemo } from 'react'

import { makeStyles } from '@material-ui/core'
import { Formik } from 'formik'
import { useSnackbar } from 'notistack'
import { Check } from 'phosphor-react'
import { useHistory, useParams } from 'react-router-dom'

import yup, { SchemaOf } from '@kathena/libs/yup'
import { ANY } from '@kathena/types'
import {
  Button,
  FileItem,
  PageContainer,
  renderApolloError,
  Spinner,
} from '@kathena/ui'
import { useAuth } from 'common/auth'
import {
  useCreateAcademicSubjectMutation,
  AcademicSubjectListDocument,
  useFindAcademicSubjectByIdQuery,
  Publication,
} from 'graphql/generated'
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
  const history = useHistory()
  const params: { id: string } = useParams()
  const { $org: org } = useAuth()
  const [createAcademicSubject] = useCreateAcademicSubjectMutation({
    refetchQueries: [
      {
        query: AcademicSubjectListDocument,
        variables: { orgId: org.id, skip: 0, limit: 10 },
      },
    ],
    context: { hasFileUpload: true },
  })
  const id = useMemo(() => params.id, [params])
  const { data, loading } = useFindAcademicSubjectByIdQuery({
    variables: {
      Id: id,
    },
  })
  const createMode = useMemo(() => {
    if (id) {
      return false
    }
    return true
  }, [id])
  const initialValues: ANY = useMemo(() => {
    if (createMode) {
      return {
        name: '',
        description: '',
        code: '',
        image: null,
      }
    }
    return {
      name: data?.academicSubject?.name,
      description: data?.academicSubject?.description,
      code: data?.academicSubject?.code,
      image: data?.academicSubject?.imageFileId,
    }
  }, [createMode, data?.academicSubject])

  const handleCreateAcademicSubject = useCallback(
    async (input: AcademicSubjectFormInput) => {
      try {
        const dataCreated = (
          await createAcademicSubject({
            variables: { input },
          })
        ).data

        const academicSubject = dataCreated?.createAcademicSubject

        if (!academicSubject) {
          return
        }
        enqueueSnackbar('Thêm môn học thành công', { variant: 'success' })
        history.push(ACADEMIC_SUBJECT_LIST)
        // eslint-disable-next-line no-console
        console.log(academicSubject)
      } catch (error) {
        const errorMessage = renderApolloError(error)()
        enqueueSnackbar(errorMessage, { variant: 'error' })
        // eslint-disable-next-line no-console
        console.error(error)
      }
    },
    [createAcademicSubject, enqueueSnackbar, history],
  )

  const handleUpdateAcademicSubject = useCallback(
    (input: AcademicSubjectFormInput) => {
      console.log(input)
    },
    [],
  )
  const handleSubmitForm = useCallback(
    async (values: AcademicSubjectFormInput) => {
      if (createMode) {
        handleCreateAcademicSubject(values)
      }
      handleUpdateAcademicSubject(values)
    },
    [createMode, handleCreateAcademicSubject, handleUpdateAcademicSubject],
  )

  if (loading) return <Spinner />

  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={initialValues}
      onSubmit={handleSubmitForm}
    >
      {(formik) => (
        <PageContainer
          title={createMode ? 'Thêm môn học mới' : 'Chỉnh sửa môn học'}
          backButtonLabel="Danh sách môn học"
          withBackButton={ACADEMIC_SUBJECT_LIST}
          actions={
            createMode
              ? [
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
                ]
              : [
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<Check />}
                  >
                    {data?.academicSubject.publication === Publication.Draft
                      ? 'Public'
                      : 'Unpublic'}
                  </Button>,
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<Check />}
                    onClick={formik.submitForm}
                    loading={formik.isSubmitting}
                  >
                    Sửa môn học
                  </Button>,
                ]
          }
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
