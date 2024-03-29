import { FC, useMemo, useCallback } from 'react'

import { CardContent, Grid, Skeleton, makeStyles } from '@material-ui/core'
import PublicationChip from 'components/PublicationChip'
import { useSnackbar } from 'notistack'
import { FilePlus } from 'phosphor-react'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { ANY } from '@kathena/types'
import {
  SectionCardSkeleton,
  SectionCard,
  usePagination,
  DataTable,
  Typography,
  Link,
  Button,
} from '@kathena/ui'
import {
  useCourseDetailQuery,
  useQuizzesQuery,
  QuizDocument,
  usePublishAllQuizOfTheCourseMutation,
} from 'graphql/generated'
import {
  buildPath,
  TEACHING_COURSE_CREATE_QUIZ,
  TEACHING_COURSE_QUIZ,
} from 'utils/path-builder'

export type ClassworkAssignmentsProps = {}

const ClassworkAssignments: FC<ClassworkAssignmentsProps> = () => {
  const classes = useStyles()
  const params: { id: string } = useParams()
  const courseId = useMemo(() => params.id, [params])
  const { data: dataCourse, loading: loadingCourse } = useCourseDetailQuery({
    variables: { id: courseId },
  })
  const course = useMemo(() => dataCourse?.findCourseById, [dataCourse])

  const { page, perPage, setPage, setPerPage } = usePagination()
  const { data: dataQuizzes, loading: loadingQuizzes } = useQuizzesQuery({
    variables: {
      courseId,
      limit: perPage,
      skip: page * perPage,
    },
  })

  const quizzes = useMemo(
    () => dataQuizzes?.quizzes.quizzes ?? [],
    [dataQuizzes?.quizzes.quizzes],
  )

  const totalCount = useMemo(
    () => dataQuizzes?.quizzes.count ?? 0,
    [dataQuizzes?.quizzes.count],
  )
  // Công khai tất cả ----
  const { enqueueSnackbar } = useSnackbar()
  const [publishAll] = usePublishAllQuizOfTheCourseMutation({
    refetchQueries: [{ query: QuizDocument }],
  })
  const handlePublishAll = useCallback(async () => {
    try {
      await publishAll({
        variables: {
          courseId,
        },
      })
      enqueueSnackbar(`Tất cả đã được công khai`, {
        variant: 'success',
      })
    } catch (error) {
      enqueueSnackbar(`Công khai thất bại`, {
        variant: 'warning',
      })
    }
  }, [courseId, publishAll, enqueueSnackbar])
  // Công khai tất cả ----
  if (loadingCourse) {
    return (
      <Grid container spacing={DASHBOARD_SPACING}>
        <Grid item xs={12}>
          <SectionCardSkeleton />
        </Grid>
      </Grid>
    )
  }
  if (loadingQuizzes) {
    return (
      <Grid container spacing={DASHBOARD_SPACING}>
        <Grid item xs={12}>
          <SectionCardSkeleton />
        </Grid>
      </Grid>
    )
  }

  if (!course) {
    return <div>Course not found</div>
  }

  return (
    <Grid container spacing={DASHBOARD_SPACING}>
      <SectionCard
        title="Thử thách trắc nghiệm"
        gridItem={{ xs: 12 }}
        action={
          <>
            <Button
              onClick={handlePublishAll}
              className={classes.buttonTextColor}
            >
              Công khai tất cả
            </Button>
            <Button
              className={classes.buttonTextColor}
              link={buildPath(TEACHING_COURSE_CREATE_QUIZ, {
                id: courseId,
              })}
              startIcon={<FilePlus size={24} />}
            >
              Thêm trắc nghiệm
            </Button>
          </>
        }
      >
        <CardContent>
          {quizzes.length ? (
            <DataTable
              data={quizzes}
              rowKey="id"
              loading={loadingQuizzes}
              columns={[
                {
                  label: 'Tiêu đề',
                  render: (quiz) => (
                    <Typography variant="body1" fontWeight="bold">
                      <Link
                        to={buildPath(TEACHING_COURSE_QUIZ, {
                          id: quiz.id,
                        })}
                      >
                        {quiz.title}
                      </Link>
                    </Typography>
                  ),
                },
                {
                  label: 'Mô tả',
                  width: 400,
                  skeleton: <Skeleton />,
                  render: ({ description }) => (
                    <div
                      // eslint-disable-next-line
                      dangerouslySetInnerHTML={{ __html: description as ANY }}
                      style={{
                        display: '-webkit-box',
                        maxWidth: 300,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                      }}
                    />
                  ),
                },
                {
                  label: 'Thời lượng',
                  skeleton: <Skeleton />,
                  render: ({ duration }) => (
                    <>{duration && <Typography>{duration} phút</Typography>}</>
                  ),
                },
                {
                  label: 'Trạng thái',
                  align: 'right',
                  skeleton: <Skeleton />,
                  render: ({ publicationState }) => (
                    <PublicationChip
                      publication={publicationState as ANY}
                      variant="outlined"
                      size="small"
                    />
                  ),
                },
              ]}
              pagination={{
                count: totalCount,
                rowsPerPage: perPage,
                page,
                onPageChange: (e, nextPage) => setPage(nextPage),
                onRowsPerPageChange: (event) => setPerPage(+event.target.value),
              }}
            />
          ) : (
            <Typography>Không có bài tập trắc nghiệm</Typography>
          )}
        </CardContent>
      </SectionCard>
    </Grid>
  )
}
const useStyles = makeStyles(({ palette }) => ({
  buttonTextColor: {
    color: palette.semantic.yellow,
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
}))
export default ClassworkAssignments
