import { FC, useMemo } from 'react'

import { makeStyles, Paper, Skeleton } from '@material-ui/core'
import PublicationChip from 'components/PublicationChip'
import format from 'date-fns/format'

import {
  DataTable,
  Link,
  PageContainer,
  Typography,
  usePagination,
} from '@kathena/ui'
import { useAuth, WithAuth } from 'common/auth'
import { Permission, useTeachingCourseListQuery } from 'graphql/generated'
import { buildPath, TEACHING_COURSE } from 'utils/path-builder'

export type TeachingCourseListProps = {}

const TeachingCourseList: FC<TeachingCourseListProps> = (props) => {
  const classes = useStyles(props)
  const { $org: org, $account: account } = useAuth()
  const { page, perPage, setPage, setPerPage } = usePagination()
  const { data, loading } = useTeachingCourseListQuery({
    variables: {
      orgId: org.id,
      limit: perPage,
      skip: page * perPage,
      lecturerIds: account.id,
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
    <PageContainer className={classes.root} title="Danh sách khóa học đang dạy">
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
                  <Link to={buildPath(TEACHING_COURSE, { id: course.id })}>
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
            {
              label: 'Học phí',
              skeleton: <Skeleton />,
              render: ({ tuitionFee }) => (
                <Typography className={classes.twoRows}>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(tuitionFee)}
                </Typography>
              ),
            },
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
              label: 'Trạng thái',
              align: 'right',
              skeleton: <Skeleton />,
              render: ({ publicationState }) => (
                <PublicationChip
                  publication={publicationState}
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

const WithPermissionTeachingCourseList = () => (
  <WithAuth permission={Permission.Teaching_Course_Access}>
    <TeachingCourseList />
  </WithAuth>
)

export default WithPermissionTeachingCourseList
