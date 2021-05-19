import { FC, useMemo } from 'react'

import { CardContent, Grid } from '@material-ui/core'
import { Trash, FilePlus } from 'phosphor-react'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import {
  Button,
  PageContainer,
  PageContainerSkeleton,
  SectionCard,
  SectionCardSkeleton,
} from '@kathena/ui'
import { useCourseDetailQuery } from 'graphql/generated'

export type ClassworkMaterialsProps = {}

const ClassworkMaterials: FC<ClassworkMaterialsProps> = () => {
  const params: { id: string } = useParams()
  const courseId = useMemo(() => params.id, [params])
  const { data, loading } = useCourseDetailQuery({
    variables: { id: courseId },
  })
  const course = useMemo(() => data?.findCourseById, [data])

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
    return <div>Course not found</div>
  }

  return (
    <Grid container spacing={DASHBOARD_SPACING}>
      <SectionCard
        title="Tài liệu"
        gridItem={{ xs: 12 }}
        action={
          <>
            <Button
              startIcon={<FilePlus size={30} />}
              size="small"
              // onClick={handleOpenCreateLecturer}
            />
          </>
        }
      >
        <CardContent>Tài Liệu Sẽ Render Tại Đây</CardContent>
      </SectionCard>
    </Grid>
  )
}

export default ClassworkMaterials
