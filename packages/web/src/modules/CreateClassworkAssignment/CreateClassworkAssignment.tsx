import { FC, useCallback, useMemo, useState } from 'react'

import { makeStyles } from '@material-ui/core'
import { Formik } from 'formik'
import { useSnackbar } from 'notistack'
import { useHistory, useParams } from 'react-router-dom'

import yup, { SchemaOf } from '@kathena/libs/yup'
import { ANY } from '@kathena/types'
import { PageContainer, renderApolloError, SplitButton } from '@kathena/ui'
import { useAuth, WithAuth } from 'common/auth'
import {
  useCreateClassworkAssignmentMutation,
  Permission,
  ClassworkAssignmentListDocument,
  Publication,
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
  attachments: yup.mixed().label(labels.attachments).notRequired() as ANY,
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
  const [publication, setPublication] = useState(Publication.Published)
  const params: { id: string } = useParams()
  const idCourse = useMemo(() => params.id, [params])
  const { enqueueSnackbar } = useSnackbar()
  const history = useHistory()
  const { $org: org } = useAuth()
  const [iframeVideos, setIframeVideos] = useState<string[]>([])
  const [createClassworkAssignment] = useCreateClassworkAssignmentMutation({
    refetchQueries: [
      {
        query: ClassworkAssignmentListDocument,
        variables: { orgId: org.id, skip: 0, limit: 10, courseId: idCourse },
      },
    ],
    context: { hasFileUpload: true },
  })

  const handleSubmitForm = useCallback(
    async (input: ClassworkAssignmentFormInput) => {
      try {
        if (!idCourse) return
        const dataCreated = (
          await createClassworkAssignment({
            variables: {
              courseId: idCourse,
              input: {
                ...input,
                publicationState: publication,
                iframeVideos
              },
            },
          })
        ).data

        const classworkAssignment = dataCreated?.createClassworkAssignment

        if (!classworkAssignment) {
          return
        }
        enqueueSnackbar(
          `${
            publication === Publication.Draft ? 'Lưu nháp' : 'Đăng'
          } bài tập thành công`,
          { variant: 'success' },
        )
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
    [
      createClassworkAssignment,
      enqueueSnackbar,
      idCourse,
      history,
      publication,
      iframeVideos,
    ],
  )

  const addIframe = (iframe: string) => {
    if(iframe.startsWith(`<iframe`) && iframe.endsWith(`></iframe>`))
    {
      const arr = [...iframeVideos]
      arr.push(iframe)
      setIframeVideos(arr)
    } else {
      enqueueSnackbar(`Vui lòng nhập đúng định dạng iframe video`, { variant: 'error' })
    }
  }

  const removeIframe = (index: number) => {
    const arr = [...iframeVideos]
    arr.splice(index, 1)
    setIframeVideos(arr)
  }

  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={initialValues}
      onSubmit={handleSubmitForm}
    >
      {(formik) => (
        <PageContainer
          title="Thêm bài tập mới"
          backButtonLabel="Danh sách bài tập"
          withBackButton={buildPath(TEACHING_COURSE_CLASSWORK_ASSIGNMENTS, {
            id: idCourse,
          })}
          actions={[
            <SplitButton
              items={[
                {
                  children: 'Đăng bài tập',
                  onClick: () => {
                    setPublication(Publication.Published)
                    formik.submitForm()
                  },
                  loading: formik.isSubmitting,
                },
                {
                  children: 'Lưu nháp bài tập',
                  onClick: () => {
                    setPublication(Publication.Draft)
                    formik.submitForm()
                  },
                  loading: formik.isSubmitting,
                },
              ]}
            />,
          ]}
          className={classes.root}
        >
          <CreateClassworkAssignmentForm iframeVideos={iframeVideos} addIframe={addIframe} removeIframe={removeIframe} />
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
