import { FC, useMemo } from 'react'

import { makeStyles, Paper, Skeleton } from '@material-ui/core'
import AccountDisplayName from 'components/AccountDisplayName'
import OrgOfficeName from 'components/OrgOfficeName'
import { format } from 'date-fns'

import {
  DataTable,
  Link,
  PageContainer,
  Typography,
  usePagination,
} from '@kathena/ui'
import { useAuth, WithAuth } from 'common/auth'
import { Permission, useCoursesQuery } from 'graphql/generated'
import { buildPath, UPDATE_ACADEMIC_COURSE } from 'utils/path-builder'

export type CourseListProps = {}

const CourseList: FC<CourseListProps> = (props) => {
  const classes = useStyles(props)
  const { $org: org } = useAuth()
  const { page, perPage, setPage, setPerPage } = usePagination()
  const { data, loading } = useCoursesQuery({
    variables: { orgId: org.id, limit: perPage, skip: page * perPage },
  })

  const courseList = useMemo(
    () => data?.courses.courses ?? [],
    [data?.courses.courses],
  )

  const totalCount = useMemo(
    () => data?.courses.count ?? 0,
    [data?.courses.count],
  )

  return (
    <>
      <PageContainer className={classes.root} title="Danh sách khóa học">
        <Paper>
          <DataTable
            data={courseList}
            rowKey="id"
            loading={loading}
            columns={[
              {
                label: 'Khóa học',
                skeleton: <Skeleton />,
                render: (course) => (
                  <>
                    <Typography variant="body1" fontWeight="bold">
                      <Link
                        to={buildPath(UPDATE_ACADEMIC_COURSE, {
                          idSubject: course.id,
                        })}
                      >
                        {course.name}
                      </Link>
                    </Typography>
                  </>
                ),
              },
              {
                label: 'Học phí',
                field: 'tuitionFee',

                skeleton: <Skeleton />,
                render: ({ tuitionFee }) => (
                  <Typography>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(tuitionFee)}
                  </Typography>
                ),
              },
              {
                label: 'Ngày bắt đầu',
                field: 'startDate',
                skeleton: <Skeleton />,
                render: ({ startDate }) => (
                  <Typography>
                    {format(new Date(startDate), 'MM/dd/yyyy')}
                  </Typography>
                ),
              },
              {
                label: 'Chi nhánh',
                skeleton: <Skeleton />,
                render: ({ orgOfficeId }) => (
                  <OrgOfficeName orgOfficeId={orgOfficeId} />
                ),
              },
              {
                label: 'Giảng viên phụ trách',
                field: 'lecturerIds',
                skeleton: <Skeleton />,
                render: ({ lecturerIds }) =>
                  lecturerIds.map((lecturerId) => (
                    <AccountDisplayName accountId={lecturerId} />
                  )),
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

const WithPermissionCourseList = () => (
  <WithAuth permission={Permission.Academic_ListCourses}>
    <CourseList />
  </WithAuth>
)
export default WithPermissionCourseList
