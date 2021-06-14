import { FC, useMemo, useState, useRef } from 'react'

import { CardContent, Grid } from '@material-ui/core'
import Comment from 'components/Comment/Comment'
import format from 'date-fns/format'
import { Bar } from 'react-chartjs-2'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { ANY } from '@kathena/types'
import {
  InfoBlock,
  SectionCardSkeleton,
  SectionCard,
  Typography,
  Button,
} from '@kathena/ui'
import { useCommentsQuery, useCourseDetailQuery } from 'graphql/generated'
import CreateComment from 'modules/CreateComment'

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

  const [lastId, setLastId] = useState<string | null>(null)

  const { data: dataComments, refetch } = useCommentsQuery({
    variables: {
      targetId: courseId,
      commentPageOptionInput: {
        limit: 5,
      },
      lastId,
    },
  })

  const comments = useMemo(
    () => dataComments?.comments.comments ?? [],
    [dataComments?.comments.comments],
  )

  const totalComments = useMemo(
    () => dataComments?.comments.count,
    [dataComments?.comments.count],
  )

  const preComments = useRef<ANY[]>(comments)
  const nextComments = useRef<ANY[]>([])

  const loadMoreComments = (lastCommentId: string) => {
    preComments.current = [...preComments.current, ...comments]
    setLastId(lastCommentId)
    refetch()
  }

  const addComment = (comment: ANY) => {
    if (lastId) nextComments.current.push(comment)
    refetch()
  }

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
      <Grid item container xs={9} spacing={DASHBOARD_SPACING}>
        <SectionCard title="Tổng quan" gridItem={{ xs: 12 }}>
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
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 12 }}
          title="Bình luận"
        >
          <CardContent>
            {comments?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column-reverse' }}>
                {lastId &&
                  nextComments.current.map((comment) => (
                    <Comment
                      comment={{
                        id: comment.id,
                        createdByAccountId: comment.createdByAccountId,
                        createdAt: comment.createdAt,
                        content: comment.content,
                      }}
                    />
                  ))}
                {preComments.current.map((comment) => (
                  <Comment
                    comment={{
                      id: comment.id,
                      createdByAccountId: comment.createdByAccountId,
                      createdAt: comment.createdAt,
                      content: comment.content,
                    }}
                  />
                ))}
                {comments.map((comment) => (
                  <Comment
                    comment={{
                      id: comment.id,
                      createdByAccountId: comment.createdByAccountId,
                      createdAt: comment.createdAt,
                      content: comment.content,
                    }}
                  />
                ))}
                <Button
                  disabled={
                    comments.length +
                      preComments.current.length +
                      nextComments.current.length ===
                    totalComments
                  }
                  onClick={() =>
                    loadMoreComments(comments[comments.length - 1].id)
                  }
                >
                  Xem thêm
                </Button>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '10px',
                }}
              >
                <Typography>Không có comment</Typography>
              </div>
            )}
            <CreateComment onSuccess={addComment} targetId={courseId} />
          </CardContent>
        </SectionCard>
      </Grid>
      <SectionCard
        title="Danh sách học viên"
        gridItem={{ xs: 3 }}
        fullHeight={false}
      >
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
