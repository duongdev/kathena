import { FC, useMemo } from 'react'

import { CardContent, Grid } from '@material-ui/core'
import format from 'date-fns/format'
import { Bar } from 'react-chartjs-2'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import {
  InfoBlock,
  SectionCardSkeleton,
  SectionCard,
  Typography,
} from '@kathena/ui'
import { useCourseDetailQuery } from 'graphql/generated'

import AccountInfoRow from '../AccountInfoRow'

export type GeneralProps = {}

const data1 = {
  labels: ['Bài 1', 'Bài 2', 'Bài 3', 'Bài 4', 'Bài 5', 'Bài 6'],
  datasets: [
    {
      label: 'Điểm trung bình',
      data: [99, 59, 30, 50, 20, 30],
      backgroundColor: ['rgba(255, 99, 132, 0.2)'],
      borderColor: ['rgba(255, 99, 132, 1)'],
      borderWidth: 1,
    },
  ],
}

const option1s = {
  scales: {
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
        },
      },
    ],
  },
}

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
        <Grid item xs={9}>
          <SectionCardSkeleton />
        </Grid>
        <Grid item xs={3}>
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
      <SectionCard title="Tổng quan" gridItem={{ xs: 9 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item container xs={5} spacing={2}>
              <InfoBlock gridItem={{ xs: 12 }} label="Tên khóa học">
                {course.name}
              </InfoBlock>
              <InfoBlock gridItem={{ xs: 12 }} label="Mã khóa học">
                {course.code}
              </InfoBlock>
              <InfoBlock gridItem={{ xs: 12 }} label="Ngày bắt đầu">
                {format(new Date(course.startDate), 'dd/MM/yyyy')}
              </InfoBlock>
              <InfoBlock gridItem={{ xs: 12 }} label="Học phí">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(course.tuitionFee)}
              </InfoBlock>
            </Grid>
            <Grid
              item
              xs={7}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography>
                Biểu đồ điểm trung bình các bài tập trong khóa
              </Typography>
              <div style={{ width: '100%' }}>
                <Bar type="bar" data={data1} options={option1s} />
              </div>
            </Grid>
            <InfoBlock gridItem={{ xs: 12 }} label="Giảng viên đảm nhận">
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
      <SectionCard title="Danh sách học viên" gridItem={{ xs: 3 }}>
        <CardContent>
          {course.studentIds.length ? (
            course.studentIds.map((studentId) => (
              <AccountInfoRow key={studentId} accountId={studentId} />
            ))
          ) : (
            <Typography>Không có học viên nào</Typography>
          )}
        </CardContent>
      </SectionCard>
    </Grid>
  )
}

export default General
