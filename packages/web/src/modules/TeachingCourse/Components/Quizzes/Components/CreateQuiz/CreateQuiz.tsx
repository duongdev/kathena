import { ChangeEvent, FC, useMemo, useState } from 'react'

import {
  CardContent,
  Grid,
  IconButton,
  makeStyles,
  Stack,
} from '@material-ui/core'
import { useSnackbar } from 'notistack'
import { X } from 'phosphor-react'
import { useHistory, useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import {
  Button,
  InputField,
  PageContainer,
  SectionCard,
  SplitButton,
  useDialogState,
} from '@kathena/ui'
import { WithAuth } from 'common/auth'
import {
  Permission,
  Publication,
  QuizzesDocument,
  useCreateQuestionMutation,
  useCreateQuizMutation,
} from 'graphql/generated'
import { buildPath, TEACHING_COURSE_QUIZZES } from 'utils/path-builder'

import CreateQuestion from './CreateQuestion'

export type CreateQuizProps = {}

const CreateQuiz: FC<CreateQuizProps> = (props) => {
  const classes = useStyles(props)

  const [createQuestionOpen, handleOpenCreateDialog, handleCloseCreateDialog] =
    useDialogState()

  const [title, setTitle] = useState('')
  const [errorMessageTitle, setErrorMessageTitle] = useState<string | null>(
    null,
  )
  const [description, setDescription] = useState('')
  const [errorMessageDescription, setErrorMessageDescription] = useState<
    string | null
  >(null)
  const [duration, setDuration] = useState(15)
  const [questions, setQuestions] = useState<
    { id: string; title: string; scores: number }[]
  >([])
  const [loadingCreateQuestions, setLoadingCreateQuestion] = useState(false)
  const [loadingCreateQuiz, setLoadingCreateQuiz] = useState(false)

  const params: { id: string } = useParams()
  const courseId = useMemo(() => params.id, [params.id])

  const onChangeTitle = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    const { value } = e.target
    if (value.trim() === '') {
      setErrorMessageTitle('Tiêu đề không được bỏ trống')
    } else {
      setErrorMessageTitle(null)
    }
    setTitle(value)
  }

  const onChangeDesc = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    const { value } = e.target
    if (value.trim() === '') {
      setErrorMessageDescription('Mô tả không được bỏ trống')
    } else {
      setErrorMessageDescription(null)
    }
    setDescription(value)
  }
  const [createQuestion] = useCreateQuestionMutation()
  const [createQuiz] = useCreateQuizMutation({
    refetchQueries: [
      {
        query: QuizzesDocument,
        variables: { skip: 0, limit: 10, courseId },
      },
    ],
  })
  const { enqueueSnackbar } = useSnackbar()
  const history = useHistory()
  const totalScore = useMemo(() => {
    let total = 0
    // eslint-disable-next-line
    questions.map((item) => {
      total += item.scores
    })
    return total
  }, [questions])

  const onRemoveQuestion = (index: number) => {
    const arr = [...questions]
    arr.splice(index, 1)
    setQuestions(arr)
  }

  const handleCreateQuestion = async (value: {
    title: string
    scores: number
    questionChoices: {
      title: string
      isRight: boolean
    }[]
  }) => {
    setLoadingCreateQuestion(true)
    const questionChoicesTitle: string[] = []
    const questionChoicesRight: boolean[] = []
    // eslint-disable-next-line
    value.questionChoices.map((item) => {
      questionChoicesTitle.push(item.title)
      questionChoicesRight.push(item.isRight)
    })
    const question = await createQuestion({
      variables: {
        input: {
          title: value.title,
          scores: value.scores,
          questionChoicesTitle,
          questionChoicesRight,
        },
      },
    })
    if (question) {
      enqueueSnackbar(`Thêm câu hỏi thành công`, { variant: 'success' })
      const arr = [...questions]
      arr.push({
        id: question.data?.createQuestion.id ?? '',
        title: question.data?.createQuestion.title ?? '',
        scores: question.data?.createQuestion.scores ?? 0,
      })
      setQuestions(arr)
    }
    setLoadingCreateQuestion(false)
  }

  const handleCreateQuiz = async (publication = Publication.Published) => {
    setLoadingCreateQuiz(true)
    const questionIds = questions.map((item) => item.id)
    const quiz = await createQuiz({
      variables: {
        input: {
          courseId,
          description,
          title,
          duration,
          publicationState: publication,
          questionIds,
        },
      },
    })
    if (quiz) {
      enqueueSnackbar(`Thêm bài trắc nghiệm thành công`, { variant: 'success' })
      history.push(
        buildPath(TEACHING_COURSE_QUIZZES, {
          id: courseId,
        }),
      )
      setLoadingCreateQuiz(false)
    } else {
      enqueueSnackbar(`Thêm bài trắc nghiệm thất bại`, { variant: 'error' })
      setLoadingCreateQuiz(false)
    }
  }

  return (
    <PageContainer
      title="Thêm bài tập trắc nghiệm"
      backButtonLabel="Danh sách trắc nghiệm"
      withBackButton={buildPath(TEACHING_COURSE_QUIZZES, {
        id: courseId,
      })}
      actions={[
        <SplitButton
          disable={
            !!errorMessageTitle ||
            !!errorMessageDescription ||
            questions.length === 0
          }
          items={[
            {
              children: 'Đăng trắc nghiệm',
              loading: loadingCreateQuiz,
              disabled:
                !!errorMessageTitle ||
                !!errorMessageDescription ||
                questions.length === 0,
              onClick: () => {
                handleCreateQuiz(Publication.Published)
              },
            },
            {
              children: 'Lưu nháp trắc nghiệm',
              loading: loadingCreateQuiz,
              disabled:
                !!errorMessageTitle ||
                !!errorMessageDescription ||
                questions.length === 0,
              onClick: () => {
                handleCreateQuiz(Publication.Draft)
              },
            },
          ]}
        />,
      ]}
      className={classes.root}
    >
      <Grid container spacing={DASHBOARD_SPACING}>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 12, sm: 6 }}
          title="Bài tập trắc nghiệm"
        >
          <CardContent>
            <Stack>
              <InputField
                required
                autoFocus
                name="title"
                label="Tiêu đề"
                value={title}
                onChange={onChangeTitle}
                error={!!errorMessageTitle}
                helperText={errorMessageTitle}
              />
            </Stack>
            <Stack mt={3}>
              <InputField
                required
                name="description"
                label="Mô tả"
                onChange={onChangeDesc}
                value={description}
                error={!!errorMessageDescription}
                helperText={errorMessageDescription}
              />
            </Stack>
            <Stack mt={3}>
              <InputField
                required
                quantity={duration}
                onQuantityChange={(value) => setDuration(value)}
                name="duration"
                variant="quantity"
                label="Thời lượng (phút)"
                min={1}
              />
            </Stack>
          </CardContent>
        </SectionCard>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 12, sm: 6 }}
          fullHeight={false}
          title={`Câu hỏi trắc nghiệm: ${questions.length} câu (${totalScore} điểm)`}
        >
          <CardContent>
            <CreateQuestion
              open={createQuestionOpen}
              onCreate={handleCreateQuestion}
              onClose={handleCloseCreateDialog}
            />
            {questions.map((item, index) => (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <p style={{ flex: 1 }}>
                  Câu {index + 1}: {item.title}
                </p>
                <IconButton
                  style={{ width: '50px' }}
                  onClick={() => onRemoveQuestion(index)}
                >
                  <X />
                </IconButton>
              </div>
            ))}
            <Button
              variant="contained"
              fullWidth
              loading={loadingCreateQuestions}
              onClick={handleOpenCreateDialog}
            >
              Thêm câu hỏi
            </Button>
          </CardContent>
        </SectionCard>
      </Grid>
    </PageContainer>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

const WithPermissionCreateQuiz = () => (
  <WithAuth permission={Permission.Teaching_Course_Access}>
    <CreateQuiz />
  </WithAuth>
)

export default WithPermissionCreateQuiz
