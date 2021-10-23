import { FC, useEffect, useMemo, useRef, useState } from 'react'

import { CardContent, Chip, Grid, Stack } from '@material-ui/core'
import { useSnackbar } from 'notistack'
import { Prompt, useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { ANY } from '@kathena/types'
import {
  Button,
  InfoBlock,
  PageContainer,
  PageContainerSkeleton,
  SectionCard,
  Typography,
} from '@kathena/ui'
import {
  QuizDocument,
  QuizSubmitDocument,
  useQuizQuery,
  useQuizSubmitQuery,
  useStartQuizMutation,
  useSubmitQuizMutation,
} from 'graphql/generated'
import { buildPath, STUDYING_COURSE_QUIZZES } from 'utils/path-builder'

import Question from './Question'

export type QuizProps = {}

const Quiz: FC<QuizProps> = () => {
  const params: { id: string } = useParams()
  const { enqueueSnackbar } = useSnackbar()
  const [startTime, setStartTime] = useState<number | null>(null)
  const [endTime, setEndTime] = useState<string>('')
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [isSubmited, setIsSubmited] = useState(false)
  const quizSubmitId = useRef<string | null>()
  const submits = useRef<{ questionId: string; questionChoiceId: string }[]>([])

  const id = useMemo(() => params.id, [params])
  const [startQuiz] = useStartQuizMutation({
    refetchQueries: [
      {
        query: QuizDocument,
        variables: { id },
      },
      {
        query: QuizSubmitDocument,
        variables: { quizId: id },
      },
    ],
  })
  const [submitQuiz] = useSubmitQuizMutation({
    refetchQueries: [
      {
        query: QuizDocument,
        variables: { id },
      },
      {
        query: QuizSubmitDocument,
        variables: { quizId: id },
      },
    ],
  })

  const { data, loading } = useQuizQuery({
    variables: { id },
  })
  const { data: dataQuizSubmit } = useQuizSubmitQuery({
    variables: {
      quizId: id,
    },
  })

  const quiz = useMemo(() => data?.quiz, [data])

  const quizSubmit = useMemo(() => {
    if (dataQuizSubmit && dataQuizSubmit?.quizSubmit) {
      quizSubmitId.current = dataQuizSubmit.quizSubmit.id
    }
    return dataQuizSubmit?.quizSubmit
  }, [dataQuizSubmit])

  useEffect(() => {
    const getIsSubmited = () => {
      if (!quizSubmit && !quizSubmitId.current) {
        setIsSubmited(false)
      } else {
        const now = new Date()
        const start = new Date(quizSubmit?.startTime)
        if (
          start.setMinutes(start.getMinutes() + (quiz?.duration ?? 0)) <
          now.getTime()
        ) {
          setIsSubmited(true)
        } else {
          setStartTime(new Date(quizSubmit?.startTime).getTime())
          setIsSubmited(false)
        }
      }
    }

    getIsSubmited()
  }, [quizSubmit, quiz, quizSubmitId])

  useEffect(() => {
    const x = setInterval(() => {
      if (startTime) {
        const start = new Date(startTime)
        const countDownDate = start.setMinutes(
          start.getMinutes() + (quiz?.duration ?? 0),
        )
        const now = new Date().getTime()
        const distance = countDownDate - now
        const minutes = Math.floor(distance / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)
        if (minutes < 0 && seconds < 0) {
          setEndTime('00:00')
          if (!isSubmited) {
            setIsSubmited(true)
            handleSubmit(true)
          }
        } else {
          setEndTime(`${minutes}:${seconds}`)
        }
      }
    }, 1000)

    return () => clearInterval(x)
    // eslint-disable-next-line
  }, [startTime, quiz])

  const questions = useMemo(() => {
    if (quiz?.questionIds) {
      let list = [...quiz?.questionIds]
      list = list.sort(() => Math.random() - 0.5)
      return list
    }
    return []
  }, [quiz])

  if (loading && !data) {
    return <PageContainerSkeleton maxWidth="md" />
  }

  if (!quiz) {
    return (
      <PageContainer maxWidth="md">
        <Typography align="center">Trắc nghiêm không tồn tại.</Typography>
      </PageContainer>
    )
  }
  const handleStart = async () => {
    const now = new Date()
    const startQuizSubmit = await startQuiz({
      variables: {
        input: {
          quizId: id,
          startTime: now,
        },
      },
    })
    if (startQuizSubmit) {
      setStartTime(now.getTime())
      enqueueSnackbar(`Bắt đầu làm bài`, { variant: 'success' })
    }
  }

  const onChangeChoice = (value: {
    questionId: string
    questionChoiceId: string
  }) => {
    const arr = [...submits.current]
    const index = arr.findIndex((item) => item.questionId === value.questionId)
    if (index !== -1) {
      arr[index].questionChoiceId = value.questionChoiceId
      submits.current = arr
    } else {
      arr.push(value)
      submits.current = arr
    }
  }

  const handleSubmit = async (last?: boolean) => {
    setLoadingSubmit(true)
    const questionIds: string[] = []
    const questionChoiceIds: string[] = []
    // eslint-disable-next-line
    submits.current.map((item) => {
      questionIds.push(item.questionId)
      questionChoiceIds.push(item.questionChoiceId)
    })
    if (quizSubmitId.current) {
      const res = await submitQuiz({
        variables: {
          input: {
            quizSubmitId: quizSubmitId.current,
            questionIds,
            questionChoiceIds,
          },
        },
      })
      if (res) {
        if (last) {
          setIsSubmited(true)
          setStartTime(null)
        }
        enqueueSnackbar(`Nộp bài thành công`, { variant: 'success' })
      }
    } else {
      enqueueSnackbar(`Nộp bài thất bại`, { variant: 'error' })
    }
    setLoadingSubmit(false)
  }
  return (
    <PageContainer
      backButtonLabel="Danh sách trắc nghiệm"
      withBackButton={buildPath(STUDYING_COURSE_QUIZZES, {
        id: quiz?.courseId as ANY,
      })}
      maxWidth="md"
      title={quiz.title}
      actions={[
        !startTime ? (
          <>
            {!isSubmited ? (
              <Button
                variant="contained"
                backgroundColorButton="primary"
                onClick={handleStart}
              >
                Bắt đầu làm bài
              </Button>
            ) : (
              <Chip color="primary" label={`${quizSubmit?.scores ?? 0} điểm`} />
            )}
          </>
        ) : (
          <Button
            backgroundColorButton="primary"
            variant="contained"
            loading={loadingSubmit}
            onClick={() => handleSubmit()}
          >
            Nộp bài: {endTime}
          </Button>
        ),
      ]}
    >
      <Prompt
        when={!!startTime}
        message="Bạn chưa hết thời gian làm !! Bạn nên nộp bài ít nhất 1 lần trước khi rời khỏi đây, bạn có thể nộp lại nếu vẫn còn thời gian nộp bài."
      />
      <Grid container spacing={DASHBOARD_SPACING}>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 12 }}
          title="Thông tin trắc nghiệm"
        >
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Stack spacing={2}>
                  <InfoBlock label="Tiêu đề">{quiz.title}</InfoBlock>
                  <InfoBlock label="Mô tả">{quiz.description}</InfoBlock>
                  <InfoBlock label="Duration">{quiz.duration} phút</InfoBlock>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </SectionCard>
        {startTime || (!startTime && isSubmited)
          ? questions.map((item, index) => (
              <Question
                id={item}
                index={index}
                quizSubmit={quizSubmit}
                onChange={(value) => onChangeChoice(value)}
                isSubmited={!startTime && isSubmited}
              />
            ))
          : ''}
      </Grid>
    </PageContainer>
  )
}

export default Quiz
