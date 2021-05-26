import { FC, useMemo } from 'react'

import { Grid, Skeleton, CardContent } from '@material-ui/core'
import PublicationChip from 'components/PublicationChip'
import format from 'date-fns/format'
import { FilePlus } from 'phosphor-react'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { ANY } from '@kathena/types'
import {
  DataTable,
  SectionCard,
  SectionCardSkeleton,
  Typography,
  Button,
  usePagination,
  Link,
} from '@kathena/ui'
// import { useAuth } from 'common/auth'
import {
  useClassworkMaterialsListQuery,
  useCourseDetailQuery,
} from 'graphql/generated'
import { buildPath, USER_PROFILE } from 'utils/path-builder'

export type ClassworkMaterialsProps = {}

const ClassworkMaterials: FC<ClassworkMaterialsProps> = () => {
  const params: { id: string } = useParams()
  const courseId = useMemo(() => params.id, [params])
  const { data, loading } = useCourseDetailQuery({
    variables: { id: courseId },
  })
  // const { $org: org } = useAuth()
  const { page, perPage, setPage, setPerPage } = usePagination()

  const course = useMemo(() => data?.findCourseById, [data])
  const { data: dataClasswork, loading: loadingClasswork } =
    useClassworkMaterialsListQuery({
      variables: {
        courseId: course?.id ?? '',
        limit: perPage,
        skip: page * perPage,
      },
    })

  const classworkMaterials = useMemo(
    () => dataClasswork?.classworkMaterials.classworkMaterials ?? [],
    [dataClasswork?.classworkMaterials.classworkMaterials],
  )

  const totalCount = useMemo(
    () => dataClasswork?.classworkMaterials.count ?? 0,
    [dataClasswork?.classworkMaterials.count],
  )
  if (loading) {
    return (
      <Grid container spacing={DASHBOARD_SPACING}>
        <Grid item xs={12}>
          <SectionCardSkeleton />
        </Grid>
      </Grid>
    )
  }

  if (!course) {
    return <div>Không có khóa học</div>
  }

  return (
    <Grid container spacing={DASHBOARD_SPACING}>
      <SectionCard
        title="Tài liệu"
        gridItem={{ xs: 12 }}
        action={<Button endIcon={<FilePlus size={30} />}>Thêm tài liệu</Button>}
      >
        <CardContent>
          {classworkMaterials.length ? (
            <DataTable
              data={classworkMaterials}
              rowKey="id"
              loading={loadingClasswork}
              columns={[
                {
                  label: 'Tiêu đề',
                  skeleton: <Skeleton />,
                  render: (classworkMaterial) => (
                    <>
                      <Link
                        to={buildPath(USER_PROFILE, {
                          username: classworkMaterial.id,
                        })}
                      >
                        <Typography variant="body1">
                          {classworkMaterial.title}
                        </Typography>
                      </Link>
                    </>
                  ),
                },
                {
                  label: 'Mô tả',
                  skeleton: <Skeleton />,
                  field: 'description',
                },
                {
                  label: 'Ngày đăng',
                  skeleton: <Skeleton />,
                  render: ({ createdAt }) => (
                    <>
                      {createdAt && (
                        <Typography>
                          {format(new Date(createdAt), 'dd/MM/yyyy')}
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
            'Không có tài liệu'
          )}
        </CardContent>
      </SectionCard>
    </Grid>
  )
}

export default ClassworkMaterials
