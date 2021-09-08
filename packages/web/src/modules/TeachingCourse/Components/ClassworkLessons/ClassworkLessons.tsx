import { FC, useMemo } from 'react'

import { CardContent, Grid, Skeleton } from '@material-ui/core'
import PublicationChip from 'components/PublicationChip'
import format from 'date-fns/format'
import { FilePlus } from 'phosphor-react'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { ANY } from '@kathena/types'
import {
  Button,
  DataTable,
  Link,
  SectionCard,
  SectionCardSkeleton,
  Typography,
  usePagination,
} from '@kathena/ui'
import {
  LessonsFilterInputStatus,
  useCourseDetailQuery,
  useListLessonsQuery,
} from 'graphql/generated'
import {
  buildPath,
  TEACHING_COURSE_CREATE_CLASSWORK_ASSIGNMENT,
  TEACHING_COURSE_DETAIL_CLASSWORK_LESSON,
} from 'utils/path-builder'

export type ClassworkLessonProps = {}

const ClassworkLesson: FC<ClassworkLessonProps> = () => {
  const params: { id: string } = useParams()
  const courseId = useMemo(() => params.id, [params])
  const { data: dataCourse, loading: loadingCourse } = useCourseDetailQuery({
    variables: { id: courseId },
  })
  const course = useMemo(() => dataCourse?.findCourseById, [dataCourse])
  const { page, perPage, setPage, setPerPage } = usePagination()
  const { data: dataClasswork, loading: loadingClasswork } =
    useListLessonsQuery({
      variables: {
        filter: {
          courseId,
          absentStudentId: null,
          endTime: null,
          startTime: null,
          status: LessonsFilterInputStatus.teaching,
          ratingStar: null,
        },
        pageOptions: {
          limit: perPage,
          skip: page * perPage,
        },
      },
    })

  const classworkLessons = useMemo(
    () => dataClasswork?.lessons.lessons ?? [],
    [dataClasswork?.lessons.lessons],
  )

  const totalCount = useMemo(
    () => dataClasswork?.lessons.count ?? 0,
    [dataClasswork?.lessons.count],
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
      <SectionCard
        title="Lộ trình"
        gridItem={{ xs: 12 }}
        action={
          <Button
            startIcon={<FilePlus size={24} />}
            link={buildPath(TEACHING_COURSE_CREATE_CLASSWORK_ASSIGNMENT, {
              id: courseId,
            })}
          >
            Thêm buổi học
          </Button>
        }
      >
        <CardContent>
          {classworkLessons.length ? (
            <DataTable
              data={classworkLessons}
              rowKey="id"
              loading={loadingClasswork}
              columns={[
                {
                  label: 'Tiêu đề',
                  render: (classworkLesson) => (
                    <Typography variant="body1" fontWeight="bold">
                      <Link
                        to={buildPath(TEACHING_COURSE_DETAIL_CLASSWORK_LESSON, {
                          id: classworkLesson.id,
                          courseDetailId: classworkLesson.courseId,
                        })}
                      >
                        {classworkLesson.description}
                      </Link>
                    </Typography>
                  ),
                },

                {
                  label: 'Thời gian bắt đầu',
                  align: 'center',
                  skeleton: <Skeleton />,
                  render: ({ startTime }) => (
                    <>
                      {startTime && (
                        <Typography>
                          {format(new Date(startTime), 'dd/MM/yyyy - h:mm a')}
                        </Typography>
                      )}
                    </>
                  ),
                },
                {
                  label: 'Thời gian kết thúc',
                  align: 'center',
                  skeleton: <Skeleton />,
                  render: ({ endTime }) => (
                    <>
                      {endTime && (
                        <Typography>
                          {format(new Date(endTime), 'dd/MM/yyyy - h:mm a')}
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
            <Typography>Không có buổi học nào</Typography>
          )}
        </CardContent>
      </SectionCard>
    </Grid>
  )
}

export default ClassworkLesson