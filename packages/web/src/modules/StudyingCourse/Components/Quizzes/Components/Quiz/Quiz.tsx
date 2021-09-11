import { FC, useMemo, useState, useEffect, useRef } from 'react'

import { CardContent, Chip, Grid, Stack } from '@material-ui/core'
import PublicationChip from 'components/PublicationChip'
import { useSnackbar } from 'notistack'
import { useParams, Prompt } from 'react-router-dom'

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
  const lastSubmisted = useRef<boolean>(false)
  const [submits, setSubmits] = useState<
    { questionId: string; questionChoiceId: string }[]
  >([])

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
          if (!lastSubmisted.current) {
            lastSubmisted.current = true
            handleSubmit()
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
    const arr = [...submits]
    const index = arr.findIndex((item) => item.questionId === value.questionId)
    if (index !== -1) {
      arr[index].questionChoiceId = value.questionChoiceId
      setSubmits(arr)
    } else {
      arr.push(value)
      setSubmits(arr)
    }
  }

  const handleSubmit = async () => {
    setLoadingSubmit(true)
    const questionIds: string[] = []
    const questionChoiceIds: string[] = []
    // eslint-disable-next-line
    submits.map((item) => {
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
        setIsSubmited(true)
        enqueueSnackbar(`Nộp bài thành công`, { variant: 'success' })
      }
    } else {
      enqueueSnackbar(`Nộp bài thất bại`, { variant: 'success' })
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
        <PublicationChip
          publication={quiz?.publicationState as ANY}
          variant="outlined"
          size="medium"
        />,
      ]}
    >
      <Prompt
        when={!!startTime}
        message="Bạn chưa nộp bài !! Bạn có thể nộp trước khi rời khỏi đây, bạn có thể nộp lại nếu vẫn còn thời gian nộp bài, bạn có chắc muốn rời khỏi mà không nộp bài ??"
      />
      <Grid container spacing={DASHBOARD_SPACING}>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 12 }}
          title="Thông tin trắc nghiệm"
          action={
            !startTime ? (
              <>
                {!isSubmited ? (
                  <Button onClick={handleStart}>Bắt đầu làm bài</Button>
                ) : (
                  <Chip
                    color="primary"
                    label={`${quizSubmit?.scores ?? 0} điểm`}
                  />
                )}
              </>
            ) : (
              <>
                {lastSubmisted.current ? (
                  <Chip
                    color="primary"
                    label={`${quizSubmit?.scores ?? 0} điểm`}
                  />
                ) : (
                  <Button
                    variant="contained"
                    loading={loadingSubmit}
                    onClick={() => handleSubmit()}
                  >
                    Nộp bài: {endTime}
                  </Button>
                )}
              </>
            )
          }
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
        {startTime
          ? questions.map((item, index) => (
              <Question
                id={item}
                index={index}
                onChange={(value) => onChangeChoice(value)}
              />
            ))
          : ''}
      </Grid>
    </PageContainer>
  )
}

export default Quiz
