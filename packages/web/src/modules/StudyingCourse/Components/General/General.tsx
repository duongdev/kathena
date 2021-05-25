import { FC, useMemo } from 'react'

import { CardContent, Grid } from '@material-ui/core'
import format from 'date-fns/format'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { InfoBlock, SectionCardSkeleton, SectionCard } from '@kathena/ui'
import { useCourseDetailQuery } from 'graphql/generated'

import AccountInfoRow from '../AccountInfoRow'

export type GeneralProps = {}

const General: FC<GeneralProps> = () => {
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
      <SectionCard title="Tổng quan" gridItem={{ xs: 12 }}>
        <CardContent>
          <Grid container spacing={2}>
            <InfoBlock gridItem={{ xs: 6 }} label="Tên khóa học">
              {course.name}
            </InfoBlock>
            <InfoBlock gridItem={{ xs: 6 }} label="Mã khóa học">
              {course.code}
            </InfoBlock>
            <InfoBlock gridItem={{ xs: 6 }} label="Ngày bắt đầu">
              {format(new Date(course.startDate), 'dd/MM/yyyy')}
            </InfoBlock>
            <InfoBlock gridItem={{ xs: 6 }} label="Học phí">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(course.tuitionFee)}
            </InfoBlock>
            <InfoBlock gridItem={{ xs: 6 }} label="Chi nhánh giảng dạy">
              Sau khi merge sẽ render lại
            </InfoBlock>
            <InfoBlock gridItem={{ xs: 6 }} label="Giảng viên đảm nhận">
              <Grid container>
                {course.lecturerIds.map((lecturerId) => (
                  <AccountInfoRow
                    gridItem={{ xs: 4 }}
                    key={lecturerId}
                    accountId={lecturerId}
                  />
                ))}
              </Grid>
            </InfoBlock>
          </Grid>
        </CardContent>
      </SectionCard>
    </Grid>
  )
}

export default General
