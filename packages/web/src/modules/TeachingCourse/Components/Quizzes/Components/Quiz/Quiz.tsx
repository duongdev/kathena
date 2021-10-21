import { FC, useMemo } from 'react'

import { CardContent, Grid, Stack } from '@material-ui/core'
import AccountAvatar from 'components/AccountAvatar/AccountAvatar'
import AccountDisplayName from 'components/AccountDisplayName'
import PublicationChip from 'components/PublicationChip'
import { useSnackbar } from 'notistack'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { ANY } from '@kathena/types'
import {
  Button,
  InfoBlock,
  Link,
  PageContainer,
  PageContainerSkeleton,
  SectionCard,
  Typography,
} from '@kathena/ui'
import { WithAuth } from 'common/auth'
import {
  Permission,
  Publication,
  QuizDocument,
  useQuizQuery,
  useUpdatePublicationQuizMutation,
  useQuizSubmitsByQuizIdQuery,
} from 'graphql/generated'
import {
  buildPath,
  TEACHING_COURSE_QUIZSUBMIT,
  TEACHING_COURSE_QUIZZES,
} from 'utils/path-builder'

import Question from './Question'

export type QuizProps = {}

const Quiz: FC<QuizProps> = () => {
  const params: { id: string } = useParams()
  const id = useMemo(() => params.id, [params])
  const { data, loading } = useQuizQuery({
    variables: { id },
  })
  const { data: dataQuizSubmits } = useQuizSubmitsByQuizIdQuery({
    variables: {
      pageOptions: {
        limit: 100000,
        skip: 0,
      },
      filter: {
        quizId: id,
      },
    },
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

  const quizSubmits = useMemo(
    () => dataQuizSubmits?.quizSubmits.quizSubmits,
    [dataQuizSubmits?.quizSubmits.quizSubmits],
  )

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
          backgroundColorButton="primary"
          variant="contained"
          onClick={() =>
            handleChangePublication(
              quiz?.publicationState === Publication.Draft
                ? Publication.Published
                : Publication.Draft,
            )
          }
        >
          {quiz?.publicationState === Publication.Draft
            ? 'Bản nháp'
            : 'Công khai'}
        </Button>,
      ]}
    >
      <Grid container spacing={DASHBOARD_SPACING}>
        <Grid item container xs={9} spacing={DASHBOARD_SPACING}>
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
        <SectionCard
          fullHeight={false}
          gridItem={{ xs: 3 }}
          title={`SV đã nộp: ${quizSubmits?.length ?? 0}`}
        >
          <CardContent>
            {quizSubmits && quizSubmits?.length > 0 ? (
              quizSubmits?.map((item) => (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '5px',
                  }}
                >
                  <AccountAvatar accountId={item.createdByAccountId} />
                  <Link
                    to={buildPath(TEACHING_COURSE_QUIZSUBMIT, { id: item.id })}
                  >
                    <AccountDisplayName
                      style={{ cursor: 'pointer', paddingLeft: '0.5em' }}
                      accountId={item.createdByAccountId}
                    />
                  </Link>
                </div>
              ))
            ) : (
              <Typography>Chưa có học viên nộp bài</Typography>
            )}
          </CardContent>
        </SectionCard>
      </Grid>
    </PageContainer>
  )
}

const WithPermissionTeachingCourse = () => (
  <WithAuth permission={Permission.Teaching_Course_Access}>
    <Quiz />
  </WithAuth>
)

export default WithPermissionTeachingCourse
