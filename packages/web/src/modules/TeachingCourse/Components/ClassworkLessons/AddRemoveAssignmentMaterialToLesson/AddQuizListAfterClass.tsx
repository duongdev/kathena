import { FC, useEffect, useState } from 'react'

import { makeStyles, Grid } from '@material-ui/core'
import { useSnackbar } from 'notistack'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { Dialog, usePagination, SectionCardSkeleton, Button } from '@kathena/ui'
import {
  FindLessonByIdDocument,
  Lesson,
  useUpdateLessonMutation,
  useQuizzesQuery,
  UpdateLessonTimeOptions,
} from 'graphql/generated'

import QuizDisplayName from '../LessonDisplayName/QuizDisplayName'

export type AddQuizListAfterClassProps = {
  open: boolean
  onClose: () => void
  idCourse: string
  lesson: Pick<
    Lesson,
    | 'description'
    | 'startTime'
    | 'endTime'
    | 'courseId'
    | 'id'
    | 'publicationState'
    | 'absentStudentIds'
    | 'classworkMaterialListBeforeClass'
    | 'classworkMaterialListInClass'
    | 'classworkMaterialListAfterClass'
    | 'classworkAssignmentListBeforeClass'
    | 'classworkAssignmentListInClass'
    | 'classworkAssignmentListAfterClass'
    | 'quizListBeforeClass'
    | 'quizListInClass'
    | 'quizListAfterClass'
  >
}

const AddQuizListAfterClass: FC<AddQuizListAfterClassProps> = (props) => {
  const { open, onClose, lesson, idCourse } = props
  const classes = useStyles(props)
  const [attachments, setAttachments] = useState<string[]>([])

  const [quizListAfterClass, setClassworkAssignmentListBeforeClass] = useState<
    string[]
  >(lesson.quizListAfterClass ?? [])

  // Cập nhật buổi học (Lesson)
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const [updateLesson] = useUpdateLessonMutation({
    refetchQueries: [
      {
        query: FindLessonByIdDocument,
        variables: { lessonId: lesson?.id ?? '' },
      },
    ],
  })
  // Lấy danh sách bài tập trắc nghiệm từ có sở dữ liệu
  const { page, perPage } = usePagination()
  const { data: dataClasswork, loading: loadingClasswork } = useQuizzesQuery({
    variables: {
      courseId: lesson.courseId,
      limit: perPage,
      skip: page * perPage,
    },
  })
  // Lấy ID bài tập từ danh sách bài tập trắc nghiệm
  useEffect(() => {
    const course = dataClasswork?.quizzes
    if (course?.quizzes && course.quizzes.length > 0) {
      const listAssignment = course.quizzes.map((item) => item.id)
      setAttachments(listAssignment)
    } else {
      setAttachments([])
    }
  }, [dataClasswork])

  // Lấy Danh sách bài tập trắc nghiệm trước buổi học
  useEffect(() => {
    setClassworkAssignmentListBeforeClass(lesson.quizListAfterClass ?? [])
  }, [open, lesson?.quizListAfterClass])

  const toggleClick = (id: string) => {
    const arr = [...quizListAfterClass]
    const index = arr.findIndex((i) => i === id)
    if (index > -1) {
      arr.splice(index, 1)
    } else {
      arr.push(id)
    }
    setClassworkAssignmentListBeforeClass(arr)
  }

  // Kiểm tra bên phía loading
  if (loadingClasswork) {
    return (
      <Grid container spacing={DASHBOARD_SPACING}>
        <Grid item xs={12}>
          <SectionCardSkeleton />
        </Grid>
      </Grid>
    )
  }
  const handleUpdate = async () => {
    if (lesson) {
      setLoading(true)
      const lessonUpdate = await updateLesson({
        variables: {
          courseId: idCourse,
          lessonId: lesson.id,
          updateInput: {
            quizListAfterClass,
            options: UpdateLessonTimeOptions.DoNotChangeTheOrderOfTheLessons,
          },
        },
      })
      if (lessonUpdate) {
        enqueueSnackbar(`Thêm thành công`, { variant: 'success' })
        onClose()
      } else {
        enqueueSnackbar(`Thêm thất bại`, { variant: 'error' })
      }
      setLoading(false)
    } else {
      enqueueSnackbar(`Thêm thất bại`, { variant: 'error' })
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      width={770}
      dialogTitle="Danh sách bài tập trắc nghiệm"
      extraDialogActions={
        <Button
          variant="contained"
          backgroundColorButton="primary"
          onClick={handleUpdate}
          loading={loading}
        >
          Lưu
        </Button>
      }
    >
      <>
        <div className={classes.root}>
          {attachments.length
            ? attachments.map((item) => {
                const inTheListAssignment =
                  quizListAfterClass.findIndex((i) => i === item) > -1
                return (
                  <div
                    onClick={() => toggleClick(item)}
                    className={`${classes.item} ${
                      inTheListAssignment ? classes.active : ''
                    }`}
                  >
                    <QuizDisplayName quizId={item} />
                  </div>
                )
              })
            : 'Không có bài tập trong danh sách'}
        </div>
      </>
    </Dialog>
  )
}

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  item: {
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
    justifyContent: 'center',
    width: '100%',
    height: '40px',
    margin: '5px',
    paddingLeft: '1em',
    borderRadius: '5px',
    background: '#f2f2f2  ',
  },
  active: {
    background: '#32CD32',
  },
}))

export default AddQuizListAfterClass
