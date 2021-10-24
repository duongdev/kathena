import { FC, useCallback, useMemo } from 'react'

import { useSnackbar } from 'notistack'

import { ANY } from '@kathena/types'
import { FormDialog } from '@kathena/ui'
import {
  Lesson,
  UpdateLessonTimeOptions,
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

  const [updateClassworkLesson] = useUpdateLessonMutation()
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
      numberOfLessonsPostponed: '0',
      options:
        UpdateLessonTimeOptions.DoNotChangeTheOrderOfTheLessons as string,
    }),
    [classworkLesson.description],
  )

  const handleUpdateClassworkLesson = useCallback(
    async (input: UpdateClassworkLessonFormInput) => {
      if (
        input.options ===
        UpdateLessonTimeOptions.DoNotChangeTheOrderOfTheLessons
      ) {
        try {
          // console.log(input)
          const { data: dataUpdated } = await updateClassworkLesson({
            variables: {
              courseId: classworkLesson.courseId,
              lessonId: classworkLesson.id,
              updateInput: {
                description: input.description,
                options:
                  UpdateLessonTimeOptions.DoNotChangeTheOrderOfTheLessons,
                numberOfLessonsPostponed: input.numberOfLessonsPostponed,
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
          enqueueSnackbar(`Sửa buổi học thất bại`, {
            variant: 'error',
          })
        }
      } else {
        const TimeStart = `${input.startDay} ${input.startTime}`
        const TimeEnd = `${input.endDay} ${input.endTime}`
        try {
          const { data: dataUpdated } = await updateClassworkLesson({
            variables: {
              courseId: classworkLesson.courseId,
              lessonId: classworkLesson.id,
              updateInput: {
                description: input.description,
                options: UpdateLessonTimeOptions.ArbitraryChange,
                startTime: TimeStart,
                endTime: TimeEnd,
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
          if (TimeStart >= TimeEnd) {
            enqueueSnackbar(
              `Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc`,
              {
                variant: 'warning',
              },
            )
          } else {
            enqueueSnackbar(`Đã có một buổi học trong thời gian này!`, {
              variant: 'error',
            })
          }
        }
      }
    },
    [updateClassworkLesson, enqueueSnackbar, classworkLesson, onClose],
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
      backgroundButton="primary"
    >
      <FormContent />
    </FormDialog>
  )
}

export default UpdateClassworkLessonDialog
