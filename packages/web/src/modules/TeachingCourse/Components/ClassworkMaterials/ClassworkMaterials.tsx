/* eslint-disable import/order */
import { FC, useMemo, useCallback } from 'react'
import { useSnackbar } from 'notistack'

import { CardContent, Grid, Skeleton, makeStyles } from '@material-ui/core'
import PublicationChip from 'components/PublicationChip'
import format from 'date-fns/format'
import { FilePlus } from 'phosphor-react'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { ANY } from '@kathena/types'
import {
  Button,
  DataTable,
  Link,
  SectionCard,
  SectionCardSkeleton,
  Typography,
  usePagination,
} from '@kathena/ui'

// import { useAuth } from 'common/auth'
import {
  useClassworkMaterialsListQuery,
  useCourseDetailQuery,
  ClassworkMaterialsListDocument,
  usePublishAllClassworkMaterialsOfTheCourseMutation,
} from 'graphql/generated'
import {
  buildPath,
  TEACHING_COURSE_CREATE_CLASSWORK_MATERIALS,
  TEACHING_COURSE_DETAIL_CLASSWORK_MATERIALS,
} from 'utils/path-builder'

export type ClassworkMaterialsProps = {}

const ClassworkMaterials: FC<ClassworkMaterialsProps> = () => {
  const classes = useStyles()
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
        courseId: courseId ?? '',
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
  // Công khai tất cả ----
  const { enqueueSnackbar } = useSnackbar()
  const [publishAll] = usePublishAllClassworkMaterialsOfTheCourseMutation({
    refetchQueries: [{ query: ClassworkMaterialsListDocument }],
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
  if (loadingClasswork) {
    return (
      <Grid container spacing={DASHBOARD_SPACING}>
        <Grid item xs={12}>
          <SectionCardSkeleton />
        </Grid>
      </Grid>
    )
  }
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
        action={
          <>
            <Button
              onClick={handlePublishAll}
              className={classes.buttonTextColor}
            >
              Công khai tất cả
            </Button>
            <Button
              link={buildPath(TEACHING_COURSE_CREATE_CLASSWORK_MATERIALS, {
                id: courseId,
              })}
              startIcon={<FilePlus size={24} />}
              className={classes.buttonTextColor}
            >
              Thêm tài liệu
            </Button>
          </>
        }
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

                  render: (classworkMaterial) => (
                    <>
                      <Typography variant="body1" fontWeight="bold">
                        <Link
                          to={buildPath(
                            TEACHING_COURSE_DETAIL_CLASSWORK_MATERIALS,
                            {
                              id: classworkMaterial.id,
                            },
                          )}
                        >
                          {classworkMaterial.title}
                        </Link>
                      </Typography>
                    </>
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
            <Typography>Không có tài liệu</Typography>
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
export default ClassworkMaterials
