import { FC, useMemo, useState, useEffect } from 'react'

import { CardContent, Grid, makeStyles } from '@material-ui/core'
import Comment from 'components/Comment/Comment'
import format from 'date-fns/format'
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
  Conversation as CommentModel,
  useConversationCreatedSubscription,
  ConversationType,
} from 'graphql/generated'
import CreateComment from 'modules/CreateComment'

import AccountInfoRow from '../AccountInfoRow'

export type GeneralProps = {}

const General: FC<GeneralProps> = () => {
  const classes = useStyles()
  const params: { id: string } = useParams()
  const courseId = useMemo(() => params.id, [params])
  const { data, loading } = useCourseDetailQuery({
    variables: { id: courseId },
  })
  const [lastId, setLastId] = useState<string | null>(null)
  const [comments, setComments] = useState<CommentModel[]>([])
  const [totalComment, setTotalComment] = useState(0)

  const course = useMemo(() => data?.findCourseById, [data])

  const { data: dataComments, refetch } = useConversationsQuery({
    variables: {
      roomId: courseId,
      conversationPageOptionInput: {
        limit: 5,
      },
      lastId,
    },
  })

  const { data: dataCommentCreated } = useConversationCreatedSubscription({
    variables: { roomId: courseId },
  })

  const loadMoreComments = (lastCommentId: string) => {
    setLastId(lastCommentId)
    refetch()
  }

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
      <SectionCard
        maxContentHeight={false}
        gridItem={{ xs: 12 }}
        title={
          <div className={classes.headerComment}>
            <Typography style={{ fontWeight: 600, fontSize: '1.3rem' }}>
              Bình luận
            </Typography>
            <Button className={classes.buttonTextColor} onClick={pinRoomChat}>
              Ghim
            </Button>
          </div>
        }
      >
        <CardContent>
          {comments?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column-reverse' }}>
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
              <Typography>Không có bình luận</Typography>
            </div>
          )}
          <CreateComment roomId={courseId} />
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
  headerComment: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '-0.25em 0em',
    alignItems: 'center',
  },
}))

export default General
