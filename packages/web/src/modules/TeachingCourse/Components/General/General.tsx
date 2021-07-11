import { FC, useMemo, useState, useEffect } from 'react'

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
import { listRoomChatVar } from 'common/cache'
import {
  useConversationsQuery,
  useCourseDetailQuery,
  useAvgGradeOfClassworkAssignmentInCourseQuery,
  useConversationCreatedSubscription,
  Conversation as CommentModel,
  ConversationType,
} from 'graphql/generated'
import CreateComment from 'modules/CreateComment'

import AccountInfoRow from '../AccountInfoRow'

export type GeneralProps = {}

const General: FC<GeneralProps> = () => {
  const params: { id: string } = useParams()
  const courseId = useMemo(() => params.id, [params])
  const [lastId, setLastId] = useState<string | null>(null)
  const [comments, setComments] = useState<CommentModel[]>([])
  const [totalComment, setTotalComment] = useState(0)

  const { data, loading } = useCourseDetailQuery({
    variables: { id: courseId },
  })

  const { data: dataAvgGrade } = useAvgGradeOfClassworkAssignmentInCourseQuery({
    variables: {
      courseId,
      optionInput: {
        limit: 6,
      },
    },
  })

  const { data: dataCommentCreated } = useConversationCreatedSubscription({
    variables: { roomId: courseId },
  })

  const { data: dataComments, refetch } = useConversationsQuery({
    variables: {
      roomId: courseId,
      conversationPageOptionInput: {
        limit: 5,
      },
      lastId,
    },
  })

  useEffect(() => {
    const newListComment = dataComments?.conversations.conversations ?? []
    const listComment = [...comments, ...newListComment]
    setComments(listComment as ANY)
    if (dataComments?.conversations.count) {
      setTotalComment(dataComments?.conversations.count)
    }

    // eslint-disable-next-line
  }, [dataComments])

  useEffect(() => {
    const newComment = dataCommentCreated?.conversationCreated
    if (newComment) {
      const listComment = [newComment, ...comments]
      setComments(listComment as ANY)
      setTotalComment(totalComment + 1)
    }
    // eslint-disable-next-line
  }, [dataCommentCreated])

  const loadMoreComments = (lastCommentId: string) => {
    setLastId(lastCommentId)
    refetch()
  }

  const pinRoomChat = () => {
    if (
      listRoomChatVar().findIndex((item) => item.roomId === courseId) === -1
    ) {
      listRoomChatVar([
        ...listRoomChatVar(),
        {
          roomId: courseId,
          type: ConversationType.Group,
        },
      ])
    }
  }

  const course = useMemo(() => data?.findCourseById, [data])

  const listAvgGrade = useMemo(
    () => dataAvgGrade?.calculateAvgGradeOfClassworkAssignmentInCourse,
    [dataAvgGrade?.calculateAvgGradeOfClassworkAssignmentInCourse],
  )
  const mappedData = useMemo(() => {
    const listLabel: string[] =
      listAvgGrade?.map((item) => `${item.classworkTitle.slice(0, 9)}...`) ?? []
    const listData: number[] = listAvgGrade?.map((item) => item.avgGrade) ?? []
    return {
      labels: listLabel,
      datasets: [
        {
          label: 'Điểm trung bình',
          data: listData,
          backgroundColor: ['rgba(255, 99, 132, 0.2)'],
          borderColor: ['rgba(255, 99, 132, 1)'],
          borderWidth: 1,
        },
      ],
    }
  }, [listAvgGrade])

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
                  <Bar
                    type="bar"
                    data={mappedData}
                    options={{
                      scales: {
                        yAxes: [
                          {
                            ticks: {
                              beginAtZero: true,
                            },
                          },
                        ],
                      },
                    }}
                  />
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
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography style={{ fontWeight: 600, fontSize: '1.3rem' }}>
                Bình luận
              </Typography>
              <Button onClick={pinRoomChat}>Ghim</Button>
            </div>
          }
        >
          <CardContent>
            {comments?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column-reverse' }}>
                {comments.map((comment: CommentModel) => (
                  <Comment
                    key={comment.id}
                    comment={{
                      id: comment.id,
                      createdByAccountId: comment.createdByAccountId,
                      createdAt: comment.createdAt,
                      content: comment.content,
                    }}
                  />
                ))}
                <Button
                  disabled={comments.length === totalComment}
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
            <CreateComment roomId={courseId} />
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
