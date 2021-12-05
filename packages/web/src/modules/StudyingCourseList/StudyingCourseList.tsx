import { FC, useMemo } from 'react'

import { makeStyles, Paper, Skeleton } from '@material-ui/core'
import AccountDisplayName from 'components/AccountDisplayName'
import Search from 'components/Search'
import format from 'date-fns/format'

import { ANY } from '@kathena/types'
import {
  DataTable,
  Link,
  PageContainer,
  useLocationQuery,
  Typography,
  usePagination,
} from '@kathena/ui'
import { useAuth, WithAuth } from 'common/auth'
import { Permission, useStudyingCourseListQuery } from 'graphql/generated'
import { buildPath, STUDYING_COURSE } from 'utils/path-builder'

export type StudyingCourseListProps = {}

const StudyingCourseList: FC<StudyingCourseListProps> = (props) => {
  const classes = useStyles(props)
  const { $org: org, $account: account } = useAuth()
  const { query } = useLocationQuery()

  const { page, perPage, setPage, setPerPage } = usePagination()
  const { data, loading } = useStudyingCourseListQuery({
    variables: {
      orgId: org.id,
      limit: perPage,
      skip: page * perPage,
      studentIds: account.id,
      searchText: query.searchText as ANY,
    },
  })

  const courses = useMemo(
    () => data?.courses.courses ?? [],
    [data?.courses.courses],
  )

  const totalCount = useMemo(
    () => data?.courses.count ?? 0,
    [data?.courses.count],
  )

  return (
    <PageContainer
      className={classes.root}
      title="Danh sách khóa học đang học"
      actions={[<Search />]}
    >
      <Paper>
        <DataTable
          data={courses}
          rowKey="id"
          loading={loading}
          columns={[
            {
              label: 'Khóa học',
              skeleton: <Skeleton />,
              render: (course) => (
                <>
                  <Link to={buildPath(STUDYING_COURSE, { id: course.id })}>
                    <Typography
                      color="body1"
                      fontWeight="bold"
                      className={classes.twoRows}
                    >
                      {course.name}
                    </Typography>
                  </Link>
                  <Typography
                    variant="button"
                    color="textSecondary"
                    className={classes.twoRows}
                  >
                    {course.code}
                  </Typography>
                </>
              ),
            },
            // {
            //   label: 'Học phí',
            //   skeleton: <Skeleton />,
            //   render: ({ tuitionFee }) => (
            //     <Typography className={classes.twoRows}>
            //       {new Intl.NumberFormat('vi-VN', {
            //         style: 'currency',
            //         currency: 'VND',
            //       }).format(tuitionFee)}
            //     </Typography>
            //   ),
            // },
            {
              label: 'Ngày bắt đầu',
              skeleton: <Skeleton />,
              render: ({ startDate }) => (
                <Typography className={classes.twoRows}>
                  {format(new Date(startDate), 'dd/MM/yyyy')}
                </Typography>
              ),
            },
            {
              label: 'Giáo viên',
              skeleton: <Skeleton />,
              render: ({ lecturerIds }) =>
                lecturerIds.map((lecturerId) => (
                  <AccountDisplayName accountId={lecturerId} />
                )),
            },
            {
              label: 'Số lượng học viên',
              skeleton: <Skeleton />,
              align: 'center',
              render: ({ studentIds }) => (
                <Typography>{studentIds.length} học viên</Typography>
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
  )
}

const useStyles = makeStyles(() => ({
  root: {},
  twoRows: {
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
  },
}))

const WithPermissionStudyingCourseList = () => (
  <WithAuth permission={Permission.Studying_Course_Access}>
    <StudyingCourseList />
  </WithAuth>
)

export default WithPermissionStudyingCourseList
