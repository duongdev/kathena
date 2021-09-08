import { FC, useMemo, useState, useEffect } from 'react'

import { CardContent, Grid, Stack } from '@material-ui/core'
import PublicationChip from 'components/PublicationChip'
import { useParams } from 'react-router-dom'

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
import { useQuizQuery } from 'graphql/generated'
import { buildPath, STUDYING_COURSE_QUIZZES } from 'utils/path-builder'

import Question from './Question'

export type QuizProps = {}

const Quiz: FC<QuizProps> = () => {
  const params: { id: string } = useParams()

  const [startTime, setStartTime] = useState<number | null>(null)
  const [endTime, setEndTime] = useState<string>('')

  const id = useMemo(() => params.id, [params])
  const { data, loading } = useQuizQuery({
    variables: { id },
  })

  const quiz = useMemo(() => data?.quiz, [data])

  useEffect(() => {
    const x = setInterval(() => {
      if (startTime) {
        const start = new Date(startTime)
        const countDownDate = start.setMinutes(
          start.getMinutes() + (quiz?.duration ?? 15),
        )
        const now = new Date().getTime()
        const distance = countDownDate - now
        const minutes = Math.floor(distance / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)
        setEndTime(`${minutes}:${seconds}`)
      }
    }, 1000)

    return () => clearInterval(x)
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

  const handleStart = () => {
    const now = new Date()
    setStartTime(now.getTime())
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
      <Grid container spacing={DASHBOARD_SPACING}>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 12 }}
          title="Thông tin trắc nghiệm"
          action={
            !startTime ? (
              <Button onClick={handleStart}>Bắt đầu làm bài</Button>
            ) : (
              <Button onClick={() => setStartTime(null)}>
                Nộp bài: {endTime}
              </Button>
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
        {startTime &&
          questions.map((item, index) => <Question id={item} index={index} />)}
      </Grid>
    </PageContainer>
  )
}

export default Quiz
