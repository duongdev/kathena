import { FC, useMemo, useCallback } from 'react'

import { CardContent, Grid, Skeleton, makeStyles } from '@material-ui/core'
import PublicationChip from 'components/PublicationChip'
import format from 'date-fns/format'
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
  useClassworkAssignmentListQuery,
  ClassworkAssignmentListDocument,
  usePublishAllClassworkAssignmentsOfTheCourseMutation,
} from 'graphql/generated'
import {
  buildPath,
  TEACHING_COURSE_CLASSWORK_ASSIGNMENT,
  TEACHING_COURSE_CREATE_CLASSWORK_ASSIGNMENT,
} from 'utils/path-builder'

export type ClassworkAssignmentsProps = {}

const ClassworkAssignments: FC<ClassworkAssignmentsProps> = () => {
  const params: { id: string } = useParams()
  const classes = useStyles()
  const courseId = useMemo(() => params.id, [params])
  const { data: dataCourse, loading: loadingCourse } = useCourseDetailQuery({
    variables: { id: courseId },
  })
  const course = useMemo(() => dataCourse?.findCourseById, [dataCourse])

  const { page, perPage, setPage, setPerPage } = usePagination()
  const { data: dataClasswork, loading: loadingClasswork } =
    useClassworkAssignmentListQuery({
      variables: {
        courseId,
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
  // Công khai tất cả ----
  const { enqueueSnackbar } = useSnackbar()
  const [publishAll] = usePublishAllClassworkAssignmentsOfTheCourseMutation({
    refetchQueries: [{ query: ClassworkAssignmentListDocument }],
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
        title="Bài tập"
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
              startIcon={<FilePlus size={24} />}
              link={buildPath(TEACHING_COURSE_CREATE_CLASSWORK_ASSIGNMENT, {
                id: courseId,
              })}
            >
              Thêm bài tập
            </Button>
          </>
        }
      >
        <CardContent>
          {classworkAssignments.length ? (
            <DataTable
              data={classworkAssignments}
              rowKey="id"
              loading={loadingClasswork}
              columns={[
                {
                  label: 'Tiêu đề',
                  render: (classworkAssignment) => (
                    <Typography variant="body1" fontWeight="bold">
                      <Link
                        to={buildPath(TEACHING_COURSE_CLASSWORK_ASSIGNMENT, {
                          id: classworkAssignment.id,
                        })}
                      >
                        {classworkAssignment.title}
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
const useStyles = makeStyles(({ palette }) => ({
  buttonTextColor: {
    color: palette.semantic.yellow,
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
}))
export default ClassworkAssignments
