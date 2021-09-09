import { FC, useCallback, useMemo, useState } from 'react'

import { makeStyles } from '@material-ui/core'
import { Formik } from 'formik'
import { useSnackbar } from 'notistack'
import { useHistory, useParams } from 'react-router-dom'

import yup, { SchemaOf } from '@kathena/libs/yup'
import { PageContainer, SplitButton } from '@kathena/ui'
import { WithAuth } from 'common/auth'
import {
  Permission,
  Publication,
  useCreateLessonMutation,
} from 'graphql/generated'
import {
  buildPath,
  TEACHING_COURSE_CLASSWORK_LESSONS,
} from 'utils/path-builder'

import CreateClassworkLessonForm from './CreateClassworkLesson.form'

export type CreateClassworkLessonProps = {}
export type CreateClassworkLessonInput = {
  description: string
  startTime: string
  endTime: string
  startDay: string
  endDay: string
}
const labels: { [k in keyof CreateClassworkLessonInput]: string } = {
  description: 'Tiêu đề',
  startTime: 'Thời gian bắt đầu',
  endTime: 'Thời gian kết thúc',
  startDay: 'Ngày bắt đầu',
  endDay: 'Ngày kết thúc',
}
const validationSchema: SchemaOf<CreateClassworkLessonInput> = yup.object({
  description: yup.string().label(labels.description).required(),
  startTime: yup.string().label(labels.startTime).trim().required(),
  endTime: yup.string().label(labels.endTime).trim().required(),
  startDay: yup.string().label(labels.startDay).trim().required(),
  endDay: yup.string().label(labels.endDay).trim().required(),
})
const initialValues = {
  description: '',
  startTime: '',
  endTime: '',
  startDay: '',
  endDay: '',
}

const CreateClassworkLesson: FC<CreateClassworkLessonProps> = (props) => {
  const classes = useStyles(props)
  const [publication, setPublication] = useState(Publication.Published)
  const params: { id: string } = useParams()
  const idCourse = useMemo(() => params.id, [params])
  const { enqueueSnackbar } = useSnackbar()
  const history = useHistory()
  const [createClassworkLesson] = useCreateLessonMutation()
  const handleSubmitForm = useCallback(
    async (input: CreateClassworkLessonInput) => {
      try {
        const TimeStart = `${input.startDay} ${input.startTime}`
        const TimeEnd = `${input.endDay} ${input.endTime}`
        if (!idCourse) return
        const dataCreated = (
          await createClassworkLesson({
            variables: {
              createLessonInput: {
                courseId: idCourse,
                description: input.description,
                endTime: TimeEnd,
                startTime: TimeStart,
                publicationState: publication,
              },
            },
          })
        ).data
        const classworkLesson = dataCreated?.createLesson

        if (!classworkLesson) {
          return
        }
        enqueueSnackbar(
          `${
            publication === Publication.Draft ? 'Lưu nháp' : 'Đăng'
          } buổi học thành công`,
          { variant: 'success' },
        )
        history.push(
          buildPath(TEACHING_COURSE_CLASSWORK_LESSONS, {
            id: idCourse,
          }),
        )
      } catch (error) {
        enqueueSnackbar('Buổi học đã tồn tại', { variant: 'error' })
      }
    },
    [createClassworkLesson, enqueueSnackbar, idCourse, history, publication],
  )

  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={initialValues}
      onSubmit={handleSubmitForm}
    >
      {(formik) => (
        <PageContainer
          maxWidth="sm"
          title="Thêm buổi học "
          backButtonLabel="Danh sách bài tập"
          withBackButton={buildPath(TEACHING_COURSE_CLASSWORK_LESSONS, {
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
          <CreateClassworkLessonForm />
        </PageContainer>
      )}
    </Formik>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))
export const classworkLessonLabels = labels

const WithPermissionCreateClassworkLesson = () => (
  <WithAuth permission={Permission.Teaching_Course_Access}>
    <CreateClassworkLesson />
  </WithAuth>
)
export default WithPermissionCreateClassworkLesson
