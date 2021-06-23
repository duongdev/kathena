import { FC, useMemo, useState, useRef } from 'react'

import { CardContent, Grid, Stack } from '@material-ui/core'
import Comment from 'components/Comment/Comment'
import FileComponent from 'components/FileComponent'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { ANY } from '@kathena/types'
import {
  Button,
  InfoBlock,
  Link,
  PageContainer,
  PageContainerSkeleton,
  SectionCard,
  Typography,
} from '@kathena/ui'
import { WithAuth } from 'common/auth'
import {
  Permission,
  useClassworkAssignmentDetailQuery,
  useFindOneClassworkSubmissionQuery,
  useCommentsQuery,
} from 'graphql/generated'
import CreateComment from 'modules/CreateComment'
import {
  buildPath,
  STUDYING_COURSE_CREATE_SUBMISSION_CLASSWORK_ASSIGNMENTS,
} from 'utils/path-builder'

export type DetailContentClassworkAssignmentProps = {}

const DetailContentClassworkAssignment: FC<DetailContentClassworkAssignmentProps> =
  () => {
    const params: { id: string } = useParams()
    const id = useMemo(() => params.id, [params])
    const { data, loading } = useClassworkAssignmentDetailQuery({
      variables: { id },
    })
    const classworkAssignment = useMemo(() => data?.classworkAssignment, [data])
    // Comment
    const addComment = (comment: ANY) => {
      if (lastId) nextComments.current.push(comment)
      refetch()
    }

    const { data: submit } = useFindOneClassworkSubmissionQuery({
      variables: { ClassworkAssignment: classworkAssignment?.id as ANY },
    })
    const classworkAssignmentSubmit = useMemo(
      () => submit?.findOneClassworkSubmission,
      [submit],
    )

    // if (!classworkAssignmentSubmit?.id) {
    //   console.log('Chưa nộp bài');
    // } else {
    //   console.log('Đã nộp bài');
    // }
    const [lastId, setLastId] = useState<string | null>(null)

    const { data: dataComments, refetch } = useCommentsQuery({
      variables: {
        targetId: id,
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
    if (loading && !data) {
      return <PageContainerSkeleton maxWidth="md" />
    }

    if (!classworkAssignment) {
      return (
        <PageContainer maxWidth="md">
          <Typography align="center">
            Bài tập không tồn tại hoặc đã bị xoá.
          </Typography>
        </PageContainer>
      )
    }
    return (
      <PageContainer
        title={classworkAssignment.title}
        withBackButton
        maxWidth="md"
        actions={[
          <>
            {!classworkAssignmentSubmit?.id ? (
              <Link
                to={buildPath(
                  STUDYING_COURSE_CREATE_SUBMISSION_CLASSWORK_ASSIGNMENTS,
                  {
                    id: classworkAssignment.id,
                  },
                )}
              >
                <Button variant="contained">Nộp bài</Button>
              </Link>
            ) : (
              <Button color="primary" variant="outlined">
                Đã nộp bài
              </Button>
            )}
          </>,
        ]}
      >
        <Grid container spacing={DASHBOARD_SPACING}>
          <SectionCard
            maxContentHeight={false}
            gridItem={{ xs: 12 }}
            title="Thông tin chi tiết bài tập"
          >
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Stack spacing={2}>
                    <InfoBlock label="Nội dung: ">
                      <div
                        // eslint-disable-next-line
                        dangerouslySetInnerHTML={{
                          __html: classworkAssignment.description as ANY,
                        }}
                      />
                    </InfoBlock>
                    <InfoBlock label="Bài tập:">
                      {classworkAssignment.attachments.length ? (
                        classworkAssignment.attachments.map((attachment) => (
                          <FileComponent key={attachment} fileId={attachment} />
                        ))
                      ) : (
                        <Typography>Không có file bài tập</Typography>
                      )}
                    </InfoBlock>
                  </Stack>
                </Grid>
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
                <div
                  style={{ display: 'flex', flexDirection: 'column-reverse' }}
                >
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
                'Không có comment'
              )}
              <CreateComment onSuccess={addComment} targetId={id} />
            </CardContent>
          </SectionCard>
        </Grid>
      </PageContainer>
    )
  }

const WithPermissionDetailContentClassworkAssignment = () => (
  <WithAuth permission={Permission.Studying_Course_Access}>
    <DetailContentClassworkAssignment />
  </WithAuth>
)

export default WithPermissionDetailContentClassworkAssignment
