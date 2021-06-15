import { FC, useMemo, useState, useRef } from 'react'

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
import { useCommentsQuery, useCourseDetailQuery } from 'graphql/generated'
import CreateComment from 'modules/CreateComment'

import AccountInfoRow from '../AccountInfoRow'

export type GeneralProps = {}

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
  )
}

export default General
