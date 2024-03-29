import { FC, useMemo } from 'react'

import { CardContent, Grid, Skeleton } from '@material-ui/core'
import PublicationChip from 'components/PublicationChip'
import format from 'date-fns/format'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { ANY } from '@kathena/types'
import {
  SectionCardSkeleton,
  SectionCard,
  usePagination,
  DataTable,
  Link,
  Typography,
} from '@kathena/ui'
import {
  useCourseDetailQuery,
  useClassworkAssignmentListQuery,
} from 'graphql/generated'
import {
  buildPath,
  STUDYING_COURSE_DETAIL_CONTENT_CLASSWORK_ASSIGNMENTS,
} from 'utils/path-builder'

export type ClassworkAssignmentsProps = {}

const ClassworkAssignments: FC<ClassworkAssignmentsProps> = () => {
  const params: { id: string } = useParams()
  const courseId = useMemo(() => params.id, [params])
  const { data: dataCourse, loading: loadingCourse } = useCourseDetailQuery({
    variables: { id: courseId },
  })
  const course = useMemo(() => dataCourse?.findCourseById, [dataCourse])

  const { page, perPage, setPage, setPerPage } = usePagination()
  const { data: dataClasswork, loading: loadingClasswork } =
    useClassworkAssignmentListQuery({
      variables: {
        courseId: course?.id ?? '',
        limit: perPage,
        skip: page * perPage,
      },
    })

  const classworkAssignments = useMemo(
    () => dataClasswork?.classworkAssignments.classworkAssignments ?? [],
    [dataClasswork?.classworkAssignments.classworkAssignments],
  )

  const totalCount = useMemo(
    () => dataClasswork?.classworkAssignments.count ?? 0,
    [dataClasswork?.classworkAssignments.count],
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
  if (loadingClasswork) {
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
      <SectionCard title="Bài tập" gridItem={{ xs: 12 }}>
        <CardContent>
          {classworkAssignments.length ? (
            <DataTable
              data={classworkAssignments}
              rowKey="id"
              loading={loadingClasswork}
              columns={[
                {
                  label: 'Tiêu đề',
                  skeleton: <Skeleton />,
                  render: (classworkAssignment) => (
                    <>
                      <Link
                        to={buildPath(
                          STUDYING_COURSE_DETAIL_CONTENT_CLASSWORK_ASSIGNMENTS,
                          {
                            id: classworkAssignment.id,
                          },
                        )}
                      >
                        <Typography variant="body1" fontWeight="bold">
                          {classworkAssignment.title}
                        </Typography>
                      </Link>
                    </>
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
                  label: 'Ngày hết hạn',
                  skeleton: <Skeleton />,
                  render: ({ dueDate }) => (
                    <>
                      {dueDate && (
                        <Typography>
                          {format(new Date(dueDate), 'dd/MM/yyyy')}
                        </Typography>
                      )}
                    </>
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
            <Typography>Không có bài tập</Typography>
          )}
        </CardContent>
      </SectionCard>
    </Grid>
  )
}

export default ClassworkAssignments
