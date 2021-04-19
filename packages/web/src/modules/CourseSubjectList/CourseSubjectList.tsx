import { FC, useMemo } from 'react'

import { makeStyles, Paper, Skeleton } from '@material-ui/core'
import { PlusCircle } from 'phosphor-react'

import {
  Button,
  DataTable,
  Link,
  PageContainer,
  Typography,
  usePagination,
} from '@kathena/ui'
import { useAuth, WithAuth } from 'common/auth'
import { Permission, useCoursesQuery } from 'graphql/generated'
import {
  buildPath,
  CREATE_ACADEMIC_COURSE,
  UPDATE_ACADEMIC_COURSE,
} from 'utils/path-builder'

export type CourseSubjectListProps = {}

const CourseSubjectList: FC<CourseSubjectListProps> = (props) => {
  const classes = useStyles(props)
  const { $org: org } = useAuth()
  const { page, perPage, setPage, setPerPage } = usePagination()
  const { data, loading } = useCoursesQuery({
    variables: { orgId: org.id, limit: perPage, skip: page * perPage },
  })

  const courseSubjectList = useMemo(() => data?.courses.courses ?? [], [
    data?.courses.courses,
  ])

  const totalCount = useMemo(() => data?.courses.count ?? 0, [
    data?.courses.count,
  ])

  return (
    <>
      <PageContainer
        className={classes.root}
        title="Danh sách khóa học"
        actions={[
          <Button
            variant="contained"
            color="primary"
            link={CREATE_ACADEMIC_COURSE}
            startIcon={<PlusCircle />}
          >
            Thêm khóa học
          </Button>,
        ]}
      >
        <Paper>
          <DataTable
            data={courseSubjectList}
            rowKey="id"
            loading={loading}
            columns={[
              {
                label: 'Khóa học',
                skeleton: <Skeleton />,
                render: (courseSubject) => (
                  <>
                    <Typography variant="body1" fontWeight="bold">
                      <Link
                        to={buildPath(UPDATE_ACADEMIC_COURSE, {
                          id: courseSubject.id,
                        })}
                      >
                        {courseSubject.name}
                      </Link>
                    </Typography>
                  </>
                ),
              },
              {
                label: 'Ngày tạo',
                field: 'createdAt',
                skeleton: <Skeleton />,
                render: ({ createdAt }) => <Typography>{createdAt}</Typography>,
              },
              {
                label: 'Học phí',
                field: 'tuitionFee',
                skeleton: <Skeleton />,
                render: ({ tuitionFee }) => (
                  <Typography>{tuitionFee}</Typography>
                ),
              },
              {
                label: 'Ngày bắt đầu',
                field: 'startDate',
                skeleton: <Skeleton />,
                render: ({ startDate }) => <Typography>{startDate}</Typography>,
              },
              {
                label: 'Giảng viên phụ trách',
                field: 'lecturerIds',
                skeleton: <Skeleton />,
                render: ({ lecturerIds }) => (
                  <Typography>{lecturerIds}</Typography>
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
        </Paper>
      </PageContainer>
    </>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

const WithPermissionCourseSubjectList = () => (
  <WithAuth permission={Permission.Academic_ListCourses}>
    <CourseSubjectList />
  </WithAuth>
)
export default WithPermissionCourseSubjectList
