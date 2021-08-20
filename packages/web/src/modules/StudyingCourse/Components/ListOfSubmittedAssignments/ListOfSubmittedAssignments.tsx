import { FC, useMemo } from 'react'

import {
  CardContent,
  Chip,
  Grid,
  makeStyles,
  Skeleton,
} from '@material-ui/core'
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
  Permission,
  useListClassworkAssignmentsByStudentIdInCourseQuery,
} from 'graphql/generated'
import {
  buildPath,
  STUDYING_COURSE_DETAIL_CONTENT_CLASSWORK_ASSIGNMENTS,
} from 'utils/path-builder'

export type ListOfSubmittedAssignmentsProps = {}

const ListOfSubmittedAssignments: FC<ListOfSubmittedAssignmentsProps> = (
  props,
) => {
  const classes = useStyles(props)
  const params: { id: string } = useParams()
  const courseId = useMemo(() => params.id, [params])

  const { page, perPage, setPage, setPerPage } = usePagination()
  const { data: dataOfSubmitted, loading: loadingOfSubmitted } =
    useListClassworkAssignmentsByStudentIdInCourseQuery({
      variables: {
        Input: {
          courseId,
          limit: perPage,
          skip: page * perPage,
          // status: All as ANY,
        },
      },
    })
  const classworkOfSubmits = useMemo(
    () =>
      dataOfSubmitted?.listClassworkAssignmentsByStudentIdInCourse.list ?? [],
    [dataOfSubmitted?.listClassworkAssignmentsByStudentIdInCourse.list],
  )
  const totalCount = useMemo(
    () =>
      dataOfSubmitted?.listClassworkAssignmentsByStudentIdInCourse.count ?? 0,
    [dataOfSubmitted?.listClassworkAssignmentsByStudentIdInCourse.count],
  )
  if (loadingOfSubmitted) {
    return (
      <Grid container spacing={DASHBOARD_SPACING}>
        <Grid item xs={12}>
          <SectionCardSkeleton />
        </Grid>
      </Grid>
    )
  }
  return (
    <Grid container spacing={DASHBOARD_SPACING}>
      <SectionCard title="Bài tập" gridItem={{ xs: 12 }}>
        <CardContent>
          {classworkOfSubmits.length ? (
            <DataTable
              data={classworkOfSubmits}
              rowKey="id"
              loading={loadingOfSubmitted}
              columns={[
                {
                  label: 'Tiêu đề',
                  skeleton: <Skeleton />,
                  render: (classworkOfSubmit) => (
                    <>
                      <Link
                        to={buildPath(
                          STUDYING_COURSE_DETAIL_CONTENT_CLASSWORK_ASSIGNMENTS,
                          {
                            id: classworkOfSubmit.classworkAssignmentId as ANY,
                          },
                        )}
                      >
                        <Typography variant="body1">
                          {classworkOfSubmit.classworkAssignmentsTitle}
                        </Typography>
                      </Link>
                    </>
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
                  label: 'Điểm',
                  skeleton: <Skeleton />,
                  render: (classworkOfSubmit) => (
                    <>
                      <Typography variant="body1">
                        {classworkOfSubmit.classworkSubmissionGrade === null ? (
                          <>
                            <Chip
                              variant="outlined"
                              className={classes.root}
                              label="Chưa chấm"
                            />
                          </>
                        ) : (
                          <>
                            {classworkOfSubmit.classworkSubmissionGrade !==
                              null &&
                            Number(classworkOfSubmit.classworkSubmissionGrade) <
                              50 ? (
                              <Chip
                                variant="outlined"
                                className={classes.root}
                                color="secondary"
                                label={
                                  classworkOfSubmit.classworkSubmissionGrade
                                }
                              />
                            ) : (
                              <Chip
                                variant="outlined"
                                className={classes.root}
                                color="primary"
                                label={
                                  classworkOfSubmit.classworkSubmissionGrade
                                }
                              />
                            )}
                          </>
                        )}
                      </Typography>
                    </>
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

const useStyles = makeStyles(() => ({
  root: {
    width: '8em',
  },
}))
const WithPermissionListOfSubmittedAssignments = () => (
  <WithAuth permission={Permission.Studying_Course_Access}>
    <ListOfSubmittedAssignments />
  </WithAuth>
)
export default WithPermissionListOfSubmittedAssignments
