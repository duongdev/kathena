import { FC, useMemo, useState, useEffect } from 'react'

import { CardContent, Grid } from '@material-ui/core'
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
import {
  useCommentsQuery,
  useCourseDetailQuery,
  Comment as CommentModel,
  useCommentCreatedSubscription,
} from 'graphql/generated'
import CreateComment from 'modules/CreateComment'

import AccountInfoRow from '../AccountInfoRow'

export type GeneralProps = {}

const General: FC<GeneralProps> = () => {
  const params: { id: string } = useParams()
  const courseId = useMemo(() => params.id, [params])
  const { data, loading } = useCourseDetailQuery({
    variables: { id: courseId },
  })
  const [lastId, setLastId] = useState<string | null>(null)
  const [comments, setComments] = useState<CommentModel[]>([])
  const [totalComment, setTotalComment] = useState(0)

  const course = useMemo(() => data?.findCourseById, [data])

  const { data: dataComments, refetch } = useCommentsQuery({
    variables: {
      targetId: courseId,
      commentPageOptionInput: {
        limit: 5,
      },
      lastId,
    },
  })

  const { data: dataCommentCreated } = useCommentCreatedSubscription({
    variables: { targetId: courseId },
  })

  const loadMoreComments = (lastCommentId: string) => {
    setLastId(lastCommentId)
    refetch()
  }

  useEffect(() => {
    const newListComment = dataComments?.comments.comments ?? []
    const listComment = [...comments, ...newListComment]
    setComments(listComment as ANY)
    if (dataComments?.comments.count) {
      setTotalComment(dataComments?.comments.count)
    }

    // eslint-disable-next-line
  }, [dataComments])

  useEffect(() => {
    const newComment = dataCommentCreated?.commentCreated
    if (newComment) {
      const listComment = [newComment, ...comments]
      setComments(listComment as ANY)
      setTotalComment(totalComment + 1)
    }
    // eslint-disable-next-line
  }, [dataCommentCreated])

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
        title="Bình luận"
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
              <Typography>Không có comment</Typography>
            </div>
          )}
          <CreateComment targetId={courseId} />
        </CardContent>
      </SectionCard>
    </Grid>
  )
}

export default General
