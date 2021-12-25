import { FC, useMemo } from 'react'

import { CardContent, Grid, Skeleton, makeStyles } from '@material-ui/core'
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
import { WithAuth } from 'common/auth'
import {
  LessonsFilterInputStatus,
  Permission,
  useCourseDetailQuery,
  useListLessonsQuery,
} from 'graphql/generated'
import {
  buildPath,
  TEACHING_COURSE_CREATE_CLASSWORK_LESSON,
  TEACHING_COURSE_DETAIL_CLASSWORK_LESSON,
} from 'utils/path-builder'

export type ClassworkLessonProps = {}

const ClassworkLesson: FC<ClassworkLessonProps> = () => {
  const classes = useStyles()
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
            className={classes.buttonTextColor}
            startIcon={<FilePlus size={24} />}
            link={buildPath(TEACHING_COURSE_CREATE_CLASSWORK_LESSON, {
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
                  render: (classworkLesson, index) => (
                    <Typography variant="body1" fontWeight="bold">
                      <Link
                        to={buildPath(TEACHING_COURSE_DETAIL_CLASSWORK_LESSON, {
                          id: classworkLesson.id,
                          courseDetailId: classworkLesson.courseId,
                        })}
                      >
                        Buổi{' '}
                        {page === 0 ? index + 1 : index + 1 + page * perPage}:{' '}
                        {classworkLesson.description}
                      </Link>
                    </Typography>
                  ),
                },

                {
                  label: 'Thời gian',
                  align: 'center',
                  skeleton: <Skeleton />,
                  render: ({ startTime, endTime }) => (
                    <>
                      {format(new Date(startTime), 'dd/MM/yyyy - h:mm a') ===
                      format(new Date(endTime), 'dd/MM/yyyy - h:mm a') ? (
                        <>
                          {startTime && (
                            <Typography>
                              {format(
                                new Date(startTime),
                                'h:mm a - dd/MM/yyyy',
                              )}
                            </Typography>
                          )}
                        </>
                      ) : (
                        <>
                          {format(new Date(startTime), 'dd/MM/yyyy') ===
                          format(new Date(endTime), 'dd/MM/yyyy') ? (
                            <>
                              {startTime && (
                                <Typography>
                                  {format(new Date(startTime), 'h:mm a')} -{' '}
                                  {format(new Date(endTime), 'h:mm a')}{' '}
                                  {format(new Date(startTime), 'dd/MM/yyyy')}
                                </Typography>
                              )}
                            </>
                          ) : (
                            <>
                              {startTime && (
                                <Typography>
                                  {format(
                                    new Date(startTime),
                                    'h:mm a - dd/MM/yyyy',
                                  )}{' '}
                                  {format(
                                    new Date(endTime),
                                    'h:mm a - dd/MM/yyyy',
                                  )}
                                </Typography>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </>
                  ),
                },
                // {
                //   label: 'Thời gian kết thúc',
                //   align: 'center',
                //   skeleton: <Skeleton />,
                //   render: ({ endTime }) => (
                //     <>
                //       {endTime && (
                //         <Typography>
                //           {format(new Date(endTime), 'h:mm a - dd/MM/yyyy')}
                //         </Typography>
                //       )}
                //     </>
                //   ),
                // },
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
const useStyles = makeStyles(({ palette }) => ({
  buttonTextColor: {
    color: palette.semantic.yellow,
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
}))
const WithPermissionClassworkLesson = () => (
  <WithAuth permission={Permission.Teaching_Course_Access}>
    <ClassworkLesson />
  </WithAuth>
)
export default WithPermissionClassworkLesson
