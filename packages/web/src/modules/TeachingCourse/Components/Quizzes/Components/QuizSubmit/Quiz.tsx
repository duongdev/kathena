import { FC, useMemo } from 'react'

import { CardContent, Grid, Stack } from '@material-ui/core'
import AccountDisplayName from 'components/AccountDisplayName'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { ANY } from '@kathena/types'
import {
  InfoBlock,
  PageContainer,
  PageContainerSkeleton,
  SectionCard,
  Typography,
} from '@kathena/ui'
import { useFindQuizSubmitByIdQuery, useQuizQuery } from 'graphql/generated'
import { buildPath, TEACHING_COURSE_QUIZ } from 'utils/path-builder'

import Question from './Question'

export type QuizSubmitProps = {}

const QuizSubmit: FC<QuizSubmitProps> = () => {
  const params: { id: string } = useParams()
  const id = useMemo(() => params.id, [params])

  const { data, loading } = useFindQuizSubmitByIdQuery({
    variables: {
      id,
    },
  })
  const quizSubmit = useMemo(
    () => data?.findQuizSubmitById,
    [data?.findQuizSubmitById],
  )

  const { data: dataQuiz, loading: loadingQuiz } = useQuizQuery({
    variables: {
      id: quizSubmit?.quizId ?? '',
    },
  })

  const quiz = useMemo(() => dataQuiz?.quiz, [dataQuiz])

  if (loading && !data && !dataQuiz && loadingQuiz) {
    return <PageContainerSkeleton maxWidth="md" />
  }

  if (!quizSubmit) {
    return (
      <PageContainer maxWidth="md">
        <Typography align="center">Bài làm không tồn tại.</Typography>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      backButtonLabel="Quay lại"
      withBackButton={buildPath(TEACHING_COURSE_QUIZ, {
        id: quiz?.id as ANY,
      })}
      maxWidth="md"
      title={quiz?.title}
    >
      <Grid container spacing={DASHBOARD_SPACING}>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 12 }}
          title="Thông tin bài làm"
        >
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Stack spacing={2}>
                  <InfoBlock label="Bài trắc nghiệm">
                    {quiz?.title} ({quiz?.duration} phút)
                  </InfoBlock>
                  <InfoBlock label="Điểm">{quizSubmit.scores} đ</InfoBlock>
                  <InfoBlock label="Sinh viên làm bài">
                    <AccountDisplayName
                      accountId={quizSubmit.createdByAccountId}
                    />
                  </InfoBlock>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </SectionCard>
        {quizSubmit.questionIds?.map((item, index) => (
          <Question
            id={item}
            index={index}
            quizSubmit={quizSubmit}
            isSubmited
          />
        ))}
      </Grid>
    </PageContainer>
  )
}

export default QuizSubmit
