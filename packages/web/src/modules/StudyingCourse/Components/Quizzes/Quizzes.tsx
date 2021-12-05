import { FC, useMemo } from 'react'

import { CardContent, Grid, Skeleton } from '@material-ui/core'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { ANY } from '@kathena/types'
import {
  DataTable,
  Link,
  SectionCard,
  SectionCardSkeleton,
  Typography,
  usePagination,
} from '@kathena/ui'
import {
  useCourseDetailQuery,
  useQuizzesStudyingQuery,
} from 'graphql/generated'
import { buildPath, STUDYING_COURSE_QUIZ } from 'utils/path-builder'

export type ClassworkAssignmentsProps = {}

const ClassworkAssignments: FC<ClassworkAssignmentsProps> = () => {
  const params: { id: string } = useParams()

  const courseId = useMemo(() => params.id, [params])
  const { data: dataCourse, loading: loadingCourse } = useCourseDetailQuery({
    variables: { id: courseId },
  })
  const course = useMemo(() => dataCourse?.findCourseById, [dataCourse])

  const { page, perPage, setPage, setPerPage } = usePagination()
  const { data: dataQuizzes, loading: loadingQuizzes } =
    useQuizzesStudyingQuery({
      variables: {
        courseId,
        limit: perPage,
        skip: page * perPage,
      },
    })

  const quizzes = useMemo(
    () => dataQuizzes?.quizzesStudying.quizzes ?? [],
    [dataQuizzes?.quizzesStudying.quizzes],
  )

  const totalCount = useMemo(
    () => dataQuizzes?.quizzesStudying.count ?? 0,
    [dataQuizzes?.quizzesStudying.count],
  )

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
      <SectionCard title="Thử thách trắc nghiệm" gridItem={{ xs: 12 }}>
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
                        to={buildPath(STUDYING_COURSE_QUIZ, {
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
                  skeleton: <Skeleton />,
                  render: ({ description }) => (
                    <div
                      // eslint-disable-next-line
                      dangerouslySetInnerHTML={{ __html: description as ANY }}
                      style={{
                        display: '-webkit-box',
                        maxWidth: 250,
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
                // {
                //   label: 'Trạng thái',
                //   align: 'right',
                //   skeleton: <Skeleton />,
                //   render: ({ publicationState }) => (
                //     <PublicationChip
                //       publication={publicationState as ANY}
                //       variant="outlined"
                //       size="small"
                //     />
                //   ),
                // },
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

export default ClassworkAssignments
