import { FC, useMemo } from 'react'

import { CardContent, Grid, Skeleton } from '@material-ui/core'
import PublicationChip from 'components/PublicationChip'
import format from 'date-fns/format'
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
import { WithAuth } from 'common/auth'
import {
  LessonsFilterInputStatus,
  Permission,
  useListLessonsQuery,
} from 'graphql/generated'
import {
  buildPath,
  STUDYING_COURSE_DETAIL_CLASSWORK_LESSON,
} from 'utils/path-builder'

export type ClassworkLessonsProps = {}

const ClassworkLessons: FC<ClassworkLessonsProps> = () => {
  const params: { id: string } = useParams()
  const courseId = useMemo(() => params.id, [params])
  const { page, perPage, setPage, setPerPage } = usePagination()
  const { data: dataClasswork, loading: loadingClasswork } =
    useListLessonsQuery({
      variables: {
        filter: {
          courseId,
          absentStudentId: null,
          endTime: null,
          startTime: null,
          status: LessonsFilterInputStatus.studying,
          ratingStar: null,
        },
        pageOptions: {
          limit: perPage,
          skip: page * perPage,
        },
      },
    })
  const classworkLessonsProps = useMemo(
    () => dataClasswork?.lessons.lessons ?? [],
    [dataClasswork?.lessons.lessons],
  )

  const totalCount = useMemo(
    () => dataClasswork?.lessons.count ?? 0,
    [dataClasswork?.lessons.count],
  )

  const classworkLessons: any[] = useMemo(() => classworkLessonsProps.map((item: any, index: any) => {
      const current = new Date()
      const startTime = new Date(item.startTime)
      const beforeLessonStartTime = classworkLessonsProps[index - 1]
        ? new Date(classworkLessonsProps[index - 1]?.startTime)
        : current
      if (
        startTime.getTime() > current.getTime() &&
        beforeLessonStartTime.getTime() <= current.getTime()
      ) {
        return {
          ...item,
          isNext: true,
        }
      }
      return {
        ...item,
        isNext: false,
      }
    }), [classworkLessonsProps])

  if (!courseId) {
    return <div>Course not found</div>
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
  return (
    <>
      <Grid container spacing={DASHBOARD_SPACING}>
        <SectionCard title="Lộ trình" gridItem={{ xs: 12 }}>
          <CardContent>
            {classworkLessons.length ? (
              <DataTable
                data={classworkLessons}
                rowKey="id"
                loading={loadingClasswork}
                columns={[
                  {
                    label: 'Tiêu đề',
                    render: (classworkLesson, index) => (
                      <Typography
                        className={
                          classworkLesson.isNext ? 'title-hightlight' : ''
                        }
                        variant="body1"
                        fontWeight="bold"
                      >
                        <Link
                          to={buildPath(
                            STUDYING_COURSE_DETAIL_CLASSWORK_LESSON,
                            {
                              id: classworkLesson.id,
                              courseDetailId: classworkLesson.courseId,
                            },
                          )}
                        >
                          Buổi{' '}
                          {page === 0 ? index + 1 : index + 1 + page * perPage}:{' '}
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
                  onRowsPerPageChange: (event) =>
                    setPerPage(+event.target.value),
                }}
              />
            ) : (
              <Typography>Không có buổi học nào</Typography>
            )}
          </CardContent>
        </SectionCard>
      </Grid>
    </>
  )
}

const WithPermissionClassworkLesson = () => (
  <WithAuth permission={Permission.Studying_Course_Access}>
    <ClassworkLessons />
  </WithAuth>
)
export default WithPermissionClassworkLesson
