/* eslint-disable @typescript-eslint/no-unused-vars */
import { FC, useCallback, useMemo } from 'react'

import { makeStyles } from '@material-ui/core'
import { Formik } from 'formik'
import { useSnackbar } from 'notistack'
import { useHistory, useParams } from 'react-router-dom'

import yup, { SchemaOf } from '@kathena/libs/yup'
import { ANY } from '@kathena/types'
import { Button, PageContainer } from '@kathena/ui'
import { WithAuth } from 'common/auth'
import {
  Permission,
  useCreateClassworkSubmissionMutation,
  useClassworkAssignmentDetailQuery,
} from 'graphql/generated'
import {
  buildPath,
  STUDYING_COURSE_DETAIL_CONTENT_CLASSWORK_ASSIGNMENTS,
} from 'utils/path-builder'

import CreateSubmissionClassworkAssignmentForm from './CreateSubmissionClassworkAssignment.form'

export type CreateSubmissionClassworkAssignmentProps = {}

export type CreateSubmissionFormInput = {
  description: string
  submissionFiles: File[] | null
}

const labels: { [k in keyof CreateSubmissionFormInput]: string } = {
  description: 'Mô tả',
  submissionFiles: 'Tập tin đính kèm',
}

const validationSchema: SchemaOf<CreateSubmissionFormInput> = yup.object({
  description: yup.string().label(labels.description).required(),
  submissionFiles: yup
    .mixed()
    .label(labels.submissionFiles)
    .notRequired() as ANY,
})

const initialValues = {
  description: '',
  submissionFiles: null,
}

const CreateSubmissionClassworkAssignment: FC<CreateSubmissionClassworkAssignmentProps> =
  (props) => {
    const classes = useStyles(props)
    const params: { id: string } = useParams()
    const id = useMemo(() => params.id, [params])
    const { data, loading } = useClassworkAssignmentDetailQuery({
      variables: { id },
    })
    const classworkAssignment = useMemo(() => data?.classworkAssignment, [data])
    const { enqueueSnackbar } = useSnackbar()
    const history = useHistory()
    const [createCreateSubmission] = useCreateClassworkSubmissionMutation()

    const handleCreateAcademicSubject = useCallback(
      async (input: CreateSubmissionFormInput) => {
        try {
          await createCreateSubmission({
            variables: {
              courseId: classworkAssignment?.courseId ?? '',
              CreateClassworkMaterialInput: {
                classworkId: classworkAssignment?.id ?? '',
                description: input.description,
                submissionFiles: input.submissionFiles as ANY,
              },
            },
          })

          enqueueSnackbar('Nộp bài tập thành công', { variant: 'success' })
          history.push(
            buildPath(STUDYING_COURSE_DETAIL_CONTENT_CLASSWORK_ASSIGNMENTS, {
              id,
            }),
          )
        } catch (err) {
          enqueueSnackbar('Nộp bài tập thất bại', { variant: 'error' })
        }
      },
      [
        createCreateSubmission,
        enqueueSnackbar,
        classworkAssignment?.id,
        history,
        id,
        classworkAssignment?.courseId,
      ],
    )
    return (
      <Formik
        validationSchema={validationSchema}
        initialValues={initialValues}
        onSubmit={handleCreateAcademicSubject}
      >
        {(formik) => (
          <PageContainer
            title="Nộp bài tập"
            backButtonLabel="Chi tiết bài tập"
            withBackButton={buildPath(
              STUDYING_COURSE_DETAIL_CONTENT_CLASSWORK_ASSIGNMENTS,
              {
                id,
              },
            )}
            actions={[
              <>
                <Button variant="contained" onClick={formik.submitForm}>
                  Nộp bài
                </Button>
              </>,
            ]}
            className={classes.root}
          >
            <CreateSubmissionClassworkAssignmentForm />
          </PageContainer>
        )}
      </Formik>
    )
  }

const useStyles = makeStyles(() => ({
  root: {},
}))
export const CreateClassworkSubmissionLabels = labels

const WithPermissionCreateCreateSubmission = () => (
  <WithAuth permission={Permission.Studying_Course_Access}>
    <CreateSubmissionClassworkAssignment />
  </WithAuth>
)

export default WithPermissionCreateCreateSubmission
