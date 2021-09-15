import { FC, useCallback, useMemo } from 'react'

import { useSnackbar } from 'notistack'

import { ANY } from '@kathena/types'
import { FormDialog } from '@kathena/ui'
import {
  Lesson,
  useFindLessonByIdQuery,
  useUpdateLessonMutation,
} from 'graphql/generated'

import {
  FormContent,
  UpdateClassworkLessonFormInput,
  validationSchema,
} from './UpdateClassworkLesson.from'

export type ClassworkLessonWithId = {
  classworkLessonId: string
}

export type ClassworkLessonWithClassworkLesson = {
  classworkLesson: Pick<
    Lesson,
    | 'description'
    | 'startTime'
    | 'endTime'
    | 'courseId'
    | 'id'
    | 'publicationState'
  >
}

export type UpdateClassworkLessonDialogProps = {
  open: boolean
  onClose: () => void
} & (ClassworkLessonWithId | ClassworkLessonWithClassworkLesson)

const UpdateClassworkLessonDialog: FC<UpdateClassworkLessonDialogProps> = (
  props,
) => {
  const { open, onClose } = props
  const { classworkLessonId } = props as ClassworkLessonWithId
  const { classworkLesson: classworkLessonProp } =
    props as ClassworkLessonWithClassworkLesson

  const [updateClassworkLesson, { error }] = useUpdateLessonMutation()
  const { data } = useFindLessonByIdQuery({
    variables: {
      lessonId: classworkLessonId,
    },
    skip: !!classworkLessonProp,
  })

  const classworkLesson = useMemo(
    () => classworkLessonProp || data?.findLessonById,
    [data?.findLessonById, classworkLessonProp],
  )
  const { enqueueSnackbar } = useSnackbar()

  const initialValues: ANY = useMemo(
    () => ({
      description: classworkLesson.description,
      startDay: '',
      startTime: '',
      endDay: '',
      endTime: '',
    }),
    [classworkLesson.description],
  )

  const handleUpdateClassworkLesson = useCallback(
    async (input: UpdateClassworkLessonFormInput) => {
      const TimeStart = `${input.startDay} ${input.startTime}`
      const TimeEnd = `${input.endDay} ${input.endTime}`
      try {
        const { data: dataUpdated } = await updateClassworkLesson({
          variables: {
            courseId: classworkLesson.courseId,
            lessonId: classworkLesson.id,
            updateInput: {
              description: input.description,
              publicationState: classworkLesson.publicationState,
            },
          },
        })
        const classworkLessonUpdated = dataUpdated?.updateLesson
        if (!classworkLessonUpdated) {
          return
        }

        enqueueSnackbar(`Sửa buổi học thành công`, {
          variant: 'success',
        })
        onClose()
      } catch (err) {
        if (TimeStart > TimeEnd) {
          enqueueSnackbar(`Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc`, {
            variant: 'warning',
          })
        } else {
          enqueueSnackbar(`Sửa buổi học thất bại`, {
            variant: 'error',
          })
        }
      }
    },
    [updateClassworkLesson, enqueueSnackbar, onClose, classworkLesson],
  )

  return (
    <FormDialog
      open={open}
      width="40vw"
      onClose={onClose}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleUpdateClassworkLesson}
      dialogTitle="Sửa buổi học"
      submitButtonLabel="Sửa"
    >
      <FormContent error={error} />
    </FormDialog>
  )
}

export default UpdateClassworkLessonDialog
