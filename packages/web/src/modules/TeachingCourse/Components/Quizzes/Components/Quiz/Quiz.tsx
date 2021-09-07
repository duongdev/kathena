import { FC, useMemo } from 'react'

import { CardContent, Grid, Stack } from '@material-ui/core'
import PublicationChip from 'components/PublicationChip'
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
import { useQuizQuery } from 'graphql/generated'
import { buildPath, TEACHING_COURSE_QUIZZES } from 'utils/path-builder'

export type QuizProps = {}

const Quiz: FC<QuizProps> = () => {
  const params: { id: string } = useParams()
  const id = useMemo(() => params.id, [params])
  const { data, loading } = useQuizQuery({
    variables: { id },
  })

  const quiz = useMemo(() => data?.quiz, [data])

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

  return (
    <PageContainer
      backButtonLabel="Danh sách trắc nghiệm"
      withBackButton={buildPath(TEACHING_COURSE_QUIZZES, {
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
      </Grid>
    </PageContainer>
  )
}

export default Quiz
