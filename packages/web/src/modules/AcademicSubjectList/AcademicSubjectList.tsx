import { FC, useMemo } from 'react'

import { makeStyles, Paper, Skeleton } from '@material-ui/core'
import { PlusCircle, Pencil } from 'phosphor-react'

import {
  Button,
  DataTable,
  Link,
  PageContainer,
  usePagination,
} from '@kathena/ui'
import { useAuth, WithAuth } from 'common/auth'
import { Permission, useAcademicSubjectListQuery } from 'graphql/generated'
import {
  buildPath,
  CREATE_ACADEMIC_SUBJECT,
  UPDATE_ACADEMIC_SUBJECT,
} from 'utils/path-builder'

export type AcademicSubjectListProps = {}

const AcademicSubjectList: FC<AcademicSubjectListProps> = (props) => {
  const classes = useStyles(props)
  const { $org: org } = useAuth()
  const { page, perPage, setPage, setPerPage } = usePagination()
  const { data, loading } = useAcademicSubjectListQuery({
    variables: { orgId: org.id, limit: perPage, skip: page * perPage },
  })

  const academicSubjectList = useMemo(
    () => data?.academicSubjects.academicSubjects ?? [],
    [data?.academicSubjects.academicSubjects],
  )

  const totalCount = useMemo(() => data?.academicSubjects.count ?? 0, [
    data?.academicSubjects.count,
  ])

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
              label: 'Mã môn học',
              field: 'code',
              width: '10%',
              skeleton: <Skeleton />,
            },
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
  <WithAuth permission={Permission.Academic_ListAcademicSubjects}>
    <AcademicSubjectList />
  </WithAuth>
)

export default WithPermissionAcademicSubjectList
