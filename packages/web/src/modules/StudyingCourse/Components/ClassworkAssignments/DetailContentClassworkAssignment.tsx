import { FC, useEffect, useMemo, useState } from 'react'

import { CardContent, Chip, Grid, Stack, makeStyles } from '@material-ui/core'
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
import { listRoomChatVar } from 'common/cache'
import {
  Permission,
  useClassworkAssignmentDetailQuery,
  useFindOneClassworkSubmissionQuery,
  useConversationsQuery,
  Conversation as ConversationModel,
  useConversationCreatedSubscription,
  ConversationType,
} from 'graphql/generated'
import CreateComment from 'modules/CreateComment'
import {
  buildPath,
  STUDYING_COURSE_LIST_OF_SUBMITTED_ASSIGNMENTS,
  STUDYING_COURSE_CREATE_SUBMISSION_CLASSWORK_ASSIGNMENTS,
  STUDYING_COURSE_DETAIL_SUBMISSION_CLASSWORK_ASSIGNMENTS,
} from 'utils/path-builder'

export type DetailContentClassworkAssignmentProps = {}

const DetailContentClassworkAssignment: FC<DetailContentClassworkAssignmentProps> =
  () => {
    const classes = useStyles()
    const params: { id: string } = useParams()
    const [lastId, setLastId] = useState<string | null>(null)
    const [comments, setComments] = useState<ConversationModel[]>([])
    const [totalComment, setTotalComment] = useState(0)

    const id = useMemo(() => params.id, [params])

    const { data, loading } = useClassworkAssignmentDetailQuery({
      variables: { id },
    })

    const classworkAssignment = useMemo(() => data?.classworkAssignment, [data])

    const { data: submit, loading: loadingSubmit } =
      useFindOneClassworkSubmissionQuery({
        variables: { ClassworkAssignment: classworkAssignment?.id as ANY },
      })

    const classworkAssignmentSubmit = useMemo(
      () => submit?.findOneClassworkSubmission,
      [submit],
    )

    const { data: dataComments, refetch } = useConversationsQuery({
      variables: {
        roomId: id,
        conversationPageOptionInput: {
          limit: 5,
        },
        lastId,
      },
    })

    const { data: dataCommentCreated } = useConversationCreatedSubscription({
      variables: { roomId: id },
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
      if (listRoomChatVar().findIndex((item) => item.roomId === id) === -1) {
        listRoomChatVar([
          ...listRoomChatVar(),
          {
            roomId: id,
            type: ConversationType.Group,
          },
        ])
      }
    }

    if (loading && !data) {
      return <PageContainerSkeleton maxWidth="md" />
    }
    if (loadingSubmit) {
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
        backButtonLabel="Danh sách bài tập"
        withBackButton={buildPath(
          STUDYING_COURSE_LIST_OF_SUBMITTED_ASSIGNMENTS,
          {
            id: classworkAssignment.courseId,
          },
        )}
        subtitle={[
          <>
            {!classworkAssignmentSubmit?.id ? (
              <Chip label="Chưa nộp bài" />
            ) : (
              <Chip color="primary" label="Đã nộp bài" />
            )}
          </>,
        ]}
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
              <Link
                to={buildPath(
                  STUDYING_COURSE_DETAIL_SUBMISSION_CLASSWORK_ASSIGNMENTS,
                  {
                    id: classworkAssignmentSubmit.id,
                  },
                )}
              >
                <Button variant="outlined" color="primary">
                  Xem chi tiết bài tập
                </Button>
              </Link>
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
            title={
              <div className={classes.headerComment}>
                <Typography style={{ fontWeight: 600, fontSize: '1.3rem' }}>
                  Bình luận
                </Typography>
                <Button
                  onClick={pinRoomChat}
                  className={classes.buttonTextColor}
                >
                  Ghim
                </Button>
              </div>
            }
          >
            <CardContent>
              {comments?.length ? (
                <div
                  style={{ display: 'flex', flexDirection: 'column-reverse' }}
                >
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
                'Không có bình luận'
              )}
              <CreateComment roomId={id} />
            </CardContent>
          </SectionCard>
        </Grid>
      </PageContainer>
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
const WithPermissionDetailContentClassworkAssignment = () => (
  <WithAuth permission={Permission.Studying_Course_Access}>
    <DetailContentClassworkAssignment />
  </WithAuth>
)

export default WithPermissionDetailContentClassworkAssignment
