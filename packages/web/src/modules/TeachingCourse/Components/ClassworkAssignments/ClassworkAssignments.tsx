import { FC, useMemo } from 'react'

import { CardContent, Grid } from '@material-ui/core'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { SectionCardSkeleton, SectionCard } from '@kathena/ui'
import { useCourseDetailQuery } from 'graphql/generated'

export type ClassworkAssignmentsProps = {}

const ClassworkAssignments: FC<ClassworkAssignmentsProps> = () => {
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
      <SectionCard title="Bài tập" gridItem={{ xs: 12 }}>
        <CardContent>Bài Tập Sẽ Render Tại Đây</CardContent>
      </SectionCard>
    </Grid>
  )
}

export default ClassworkAssignments
