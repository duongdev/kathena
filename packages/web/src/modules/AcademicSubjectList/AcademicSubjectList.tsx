import { FC } from 'react'

import { makeStyles, Paper, Skeleton } from '@material-ui/core'
import { PlusCircle, Pencil } from 'phosphor-react'

import { ANY } from '@kathena/types'
import {
  Button,
  DataTable,
  Link,
  PageContainer,
  usePagination,
} from '@kathena/ui'
import { WithAuth } from 'common/auth'
import {
  buildPath,
  CREATE_ACADEMIC_SUBJECT,
  UPDATE_ACADEMIC_SUBJECT,
} from 'utils/path-builder'

export type AcademicSubjectListProps = {}

const AcademicSubjectList: FC<AcademicSubjectListProps> = (props) => {
  const classes = useStyles(props)
  const { page, perPage, setPage, setPerPage } = usePagination()

  const academicSubjectList: ANY[] = [
    // Get List Academic Subject Here
    {
      id: 'dayla1objectidtuche',
      name: 'HTML',
      description: 'Front end co ban',
      tuitionFee: 2000000,
    },
  ]
  const loading = false

  const totalCount = 0
  return (
    <PageContainer
      className={classes.root}
      title="Danh sách môn học"
      actions={[
        <Button
          variant="contained"
          color="primary"
          link={CREATE_ACADEMIC_SUBJECT}
          startIcon={<PlusCircle />}
        >
          Thêm môn học
        </Button>,
      ]}
    >
      <Paper>
        <DataTable
          data={academicSubjectList}
          rowKey="id"
          loading={loading}
          columns={[
            {
              label: 'Tên môn học',
              field: 'name',
              skeleton: <Skeleton />,
            },
            {
              label: 'Mô tả',
              field: 'description',
              skeleton: <Skeleton />,
            },
            {
              label: 'Học phí (gốc)',
              field: 'tuitionFee',
              skeleton: <Skeleton />,
            },
            {
              render: (academicSubject) => (
                <Link
                  to={buildPath(UPDATE_ACADEMIC_SUBJECT, {
                    id: academicSubject.id,
                  })}
                >
                  <Pencil size={24} />
                </Link>
              ),
              skeleton: <Skeleton />,
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
}))

const WithPermissionAcademicSubjectList = () => (
  <WithAuth>
    <AcademicSubjectList />
  </WithAuth>
)

export default WithPermissionAcademicSubjectList
