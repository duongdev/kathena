import { FC, useMemo } from 'react'

import { CardContent, Grid, Stack } from '@material-ui/core'
import PublicationChip from 'components/PublicationChip'
import { useSnackbar } from 'notistack'
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
import {
  Publication,
  QuizDocument,
  useQuizQuery,
  useUpdatePublicationQuizMutation,
} from 'graphql/generated'
import { buildPath, TEACHING_COURSE_QUIZZES } from 'utils/path-builder'

import Question from './Question'

export type QuizProps = {}

const Quiz: FC<QuizProps> = () => {
  const params: { id: string } = useParams()
  const id = useMemo(() => params.id, [params])
  const { data, loading } = useQuizQuery({
    variables: { id },
  })
  const { enqueueSnackbar } = useSnackbar()
  const [updatePublicationQuiz] = useUpdatePublicationQuizMutation({
    refetchQueries: [
      {
        query: QuizDocument,
        variables: { id },
      },
    ],
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

  const handleChangePublication = async (publicationState: Publication) => {
    const updated = await updatePublicationQuiz({
      variables: {
        id,
        publicationState,
      },
    })
    if (updated) {
      enqueueSnackbar(`Cập nhật thành công`, { variant: 'success' })
    } else {
      enqueueSnackbar(`Cập nhật thất bại`, { variant: 'error' })
    }
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
        <Button
          variant="contained"
          onClick={() =>
            handleChangePublication(
              quiz?.publicationState === Publication.Draft
                ? Publication.Published
                : Publication.Draft,
            )
          }
        >
          {quiz?.publicationState === Publication.Draft ? 'Public' : 'Draft'}
        </Button>,
      ]}
    >
      <Grid container spacing={DASHBOARD_SPACING}>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 12 }}
          title="Thông tin trắc nghiệm"
          action={
            <PublicationChip
              publication={quiz?.publicationState as ANY}
              variant="outlined"
              size="medium"
            />
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
        {quiz.questionIds.map((item, index) => (
          <Question id={item} index={index} />
        ))}
      </Grid>
    </PageContainer>
  )
}

export default Quiz
