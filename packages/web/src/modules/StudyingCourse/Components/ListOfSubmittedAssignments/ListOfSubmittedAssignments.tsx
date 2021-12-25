import React, { FC, useMemo, useState } from 'react'

import {
  CardContent,
  Chip,
  Grid,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
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
  ClassworkAssignmentByStudentIdInCourseInputStatus,
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
  const [statusSubmit, setStatusSubmit] = useState({
    label: 'Tất cả',
    valueStatusSubmit: ClassworkAssignmentByStudentIdInCourseInputStatus.All,
  })
  const { page, perPage, setPage, setPerPage } = usePagination()
  const { data: dataOfSubmitted, loading: loadingOfSubmitted } =
    useListClassworkAssignmentsByStudentIdInCourseQuery({
      variables: {
        Input: {
          courseId,
          limit: perPage,
          skip: page * perPage,
          status: statusSubmit.valueStatusSubmit,
        },
      },
    })

  const classworkOfSubmits = useMemo(
    () =>
      dataOfSubmitted?.listClassworkAssignmentsByStudentIdInCourse.list ?? [],
    [dataOfSubmitted?.listClassworkAssignmentsByStudentIdInCourse.list],
  )
  const classworkSubmit: ANY[] = useMemo(
    () =>
      classworkOfSubmits.map((item: ANY, index: ANY) => {
        const current = new Date()
        const duaDateSubmit = new Date(item.dueDate)
        const beforeSubmitDueDate = classworkOfSubmits[index - 1]
          ? new Date(classworkOfSubmits[index - 1]?.dueDate)
          : current
        if (
          duaDateSubmit.getTime() > current.getTime() &&
          beforeSubmitDueDate.getTime() <= current.getTime()
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
      }),
    [classworkOfSubmits],
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

  const handleChangeStatusSubmit = (
    event: React.ChangeEvent<{ value: unknown }>,
  ) => {
    // Cập nhật lại state hiển thị
    setStatusSubmit({
      ...statusSubmit,
      valueStatusSubmit: event.target.value as ANY,
    })
  }
  const arrayOptionStatus = [
    {
      id: 1,
      label: 'Tất cả',
      value: ClassworkAssignmentByStudentIdInCourseInputStatus.All,
    },
    {
      id: 2,
      label: 'Bài tập đã nộp',
      value: ClassworkAssignmentByStudentIdInCourseInputStatus.HaveSubmission,
    },
    {
      id: 3,
      label: 'Bài tập chưa nộp',
      value:
        ClassworkAssignmentByStudentIdInCourseInputStatus.HaveNotSubmission,
    },
  ]

  return (
    <Grid container spacing={DASHBOARD_SPACING}>
      <SectionCard
        title="Bài tập"
        gridItem={{ xs: 12 }}
        action={[
          <div className={classes.headerSearch}>
            {/* <Typography>Tìm kiếm:</Typography> */}
            <InputLabel className={classes.labelSearch}>Tìm kiếm</InputLabel>
            <Select
              className={classes.selectStatus}
              value={statusSubmit.valueStatusSubmit}
              onChange={handleChangeStatusSubmit}
            >
              {arrayOptionStatus?.map((OptionStatus) => (
                <MenuItem key={OptionStatus.id} value={OptionStatus.value}>
                  {OptionStatus.label ?? OptionStatus.value}
                </MenuItem>
              ))}
            </Select>
          </div>,
        ]}
      >
        <CardContent>
          {classworkSubmit.length ? (
            <DataTable
              data={classworkSubmit}
              rowKey="id"
              loading={loadingOfSubmitted}
              columns={[
                {
                  label: 'Tiêu đề',
                  skeleton: <Skeleton />,
                  render: (classworkOfSubmit) => (
                    <>
                      <Link
                        className={
                          classworkOfSubmit.isNext ? 'title-hightlight' : ''
                        }
                        to={buildPath(
                          STUDYING_COURSE_DETAIL_CONTENT_CLASSWORK_ASSIGNMENTS,
                          {
                            id: classworkOfSubmit.classworkAssignmentId as ANY,
                          },
                        )}
                      >
                        <Typography variant="body1" fontWeight="bold">
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
                  width: 20,
                  align: 'center',
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

const useStyles = makeStyles(({ palette }) => ({
  root: {
    width: '8em',
  },
  selectStatus: {
    color: 'black',
    width: '13em',
    height: '2.75em',
    backgroundColor: palette.background.paper,
  },
  labelSearch: {
    color: palette.background.paper,
    marginRight: '1em',
  },
  headerSearch: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '-0.25em 0em',
    alignItems: 'center',
  },
}))
const WithPermissionListOfSubmittedAssignments = () => (
  <WithAuth permission={Permission.Studying_Course_Access}>
    <ListOfSubmittedAssignments />
  </WithAuth>
)
export default WithPermissionListOfSubmittedAssignments
