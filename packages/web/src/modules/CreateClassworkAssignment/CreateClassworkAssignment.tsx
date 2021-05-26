import { FC, useCallback, useMemo } from 'react'

import { makeStyles } from '@material-ui/core'
import { Formik } from 'formik'
import { useSnackbar } from 'notistack'
import { Check } from 'phosphor-react'
import { useHistory, useParams } from 'react-router-dom'

import yup, { SchemaOf } from '@kathena/libs/yup'
import { ANY } from '@kathena/types'
import { Button, PageContainer, renderApolloError } from '@kathena/ui'
import { useAuth, WithAuth } from 'common/auth'
import {
  useCreateClassworkAssignmentMutation,
  Permission,
  ClassworkAssignmentListDocument,
} from 'graphql/generated'
import {
  buildPath,
  TEACHING_COURSE_CLASSWORK_ASSIGNMENTS,
} from 'utils/path-builder'

import CreateClassworkAssignmentForm from './CreateClassworkAssignment.form'

export type CreateClassworkAssignmentProps = {}

export type ClassworkAssignmentFormInput = {
  title: string
  description: string
  dueDate: string
  attachments: File[] | null
}

const labels: { [k in keyof ClassworkAssignmentFormInput]: string } = {
  title: 'Tiêu đề',
  description: 'Mô tả',
  dueDate: 'Ngày hết hạn',
  attachments: 'Tập tin đính kèm',
}

const validationSchema: SchemaOf<ClassworkAssignmentFormInput> = yup.object({
  title: yup.string().label(labels.title).trim().required(),
  description: yup.string().label(labels.description).required(),
  dueDate: yup.string().label(labels.dueDate).trim().required(),
  attachments: yup.mixed().label(labels.attachments).required() as ANY,
})

const initialValues = {
  title: '',
  description: '',
  dueDate: '',
  attachments: null,
}

const CreateClassworkAssignment: FC<CreateClassworkAssignmentProps> = (
  props,
) => {
  const classes = useStyles(props)
  const params: { id: string } = useParams()
  const idCourse = useMemo(() => params.id, [params])
  const { enqueueSnackbar } = useSnackbar()
  const history = useHistory()
  const { $org: org } = useAuth()
  const [createClassworkAssignment] = useCreateClassworkAssignmentMutation({
    refetchQueries: [
      {
        query: ClassworkAssignmentListDocument,
        variables: { orgId: org.id, skip: 0, limit: 10, courseId: idCourse },
      },
    ],
    context: { hasFileUpload: true },
  })

  const handleCreateAcademicSubject = useCallback(
    async (input: ClassworkAssignmentFormInput) => {
      try {
        if (!idCourse) return
        const dataCreated = (
          await createClassworkAssignment({
            variables: { courseId: idCourse, input: input as ANY },
          })
        ).data

        const classworkAssignment = dataCreated?.createClassworkAssignment

        if (!classworkAssignment) {
          return
        }
        enqueueSnackbar('Thêm bài tập thành công', { variant: 'success' })
        history.push(
          buildPath(TEACHING_COURSE_CLASSWORK_ASSIGNMENTS, {
            id: idCourse,
          }),
        )
        // eslint-disable-next-line no-console
        console.log(classworkAssignment)
      } catch (error) {
        const errorMessage = renderApolloError(error)()
        enqueueSnackbar(errorMessage, { variant: 'error' })
        // eslint-disable-next-line no-console
        console.error(error)
      }
    },
    [createClassworkAssignment, enqueueSnackbar, idCourse, history],
  )

  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={initialValues}
      onSubmit={handleCreateAcademicSubject}
    >
      {(formik) => (
        <PageContainer
          title="Thêm bài tập mới"
          backButtonLabel="Danh sách bài tập"
          withBackButton={buildPath(TEACHING_COURSE_CLASSWORK_ASSIGNMENTS, {
            id: idCourse,
          })}
          actions={[
            <Button
              variant="contained"
              color="primary"
              startIcon={<Check />}
              onClick={formik.submitForm}
              loading={formik.isSubmitting}
            >
              Tạo bài tập
            </Button>,
          ]}
          className={classes.root}
        >
          <CreateClassworkAssignmentForm />
        </PageContainer>
      )}
    </Formik>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export const classworkAssignmentLabels = labels

const WithPermissionCreateClassworkAssignment = () => (
  <WithAuth permission={Permission.Teaching_Course_Access}>
    <CreateClassworkAssignment />
  </WithAuth>
)

export default WithPermissionCreateClassworkAssignment
