import { FC, useMemo, useEffect, useState } from 'react'

import { CardContent, Grid, makeStyles, Stack } from '@material-ui/core'
import Comment from 'components/Comment/Comment'
import FileComponent from 'components/FileComponent'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { ANY } from '@kathena/types'
import {
  Button,
  InfoBlock,
  PageContainer,
  SectionCard,
  SectionCardSkeleton,
  Typography,
} from '@kathena/ui'
import { WithAuth } from 'common/auth'
import { listRoomChatVar } from 'common/cache'
import {
  Permission,
  useConversationsQuery,
  useDetailClassworkMaterialQuery,
  Conversation as ConversationModel,
  useConversationCreatedSubscription,
  ConversationType,
} from 'graphql/generated'
import CreateComment from 'modules/CreateComment'
import {
  buildPath,
  STUDYING_COURSE_CLASSWORK_MATERIALS,
} from 'utils/path-builder'

export type DetailContentClassworkMaterialProps = {}

const DetailContentClassworkMaterial: FC<DetailContentClassworkMaterialProps> =
  (props) => {
    const classes = useStyles(props)
    const params: { id: string } = useParams()
    const id = useMemo(() => params.id, [params.id])
    const [lastId, setLastId] = useState<string | null>(null)
    const [comments, setComments] = useState<ConversationModel[]>([])
    const [totalComment, setTotalComment] = useState(0)
    const { data, loading } = useDetailClassworkMaterialQuery({
      variables: { Id: id },
    })
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

    const classworkMaterial = useMemo(() => data?.classworkMaterial, [data])

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
    return (
      <PageContainer
        backButtonLabel="Danh sách tài liệu"
        withBackButton={buildPath(STUDYING_COURSE_CLASSWORK_MATERIALS, {
          id: classworkMaterial?.courseId as ANY,
        })}
        maxWidth="md"
        title={`${classworkMaterial?.title}`}
      >
        <Grid container spacing={DASHBOARD_SPACING}>
          <SectionCard
            maxContentHeight={false}
            gridItem={{ xs: 12 }}
            title="Thông tin tài liệu"
          >
            <CardContent>
              <Grid container spacing={2} className={classes.root}>
                <Grid item xs={12}>
                  <Stack spacing={2}>
                    <InfoBlock label="Tiêu đề:">
                      {`${classworkMaterial?.title}`}
                    </InfoBlock>
                    <InfoBlock label="Mô tả:">
                      <div
                        // eslint-disable-next-line
                        dangerouslySetInnerHTML={{
                          __html: classworkMaterial?.description as ANY,
                        }}
                      />
                    </InfoBlock>
                    <InfoBlock label="Tập tin đính kèm: ">
                      {classworkMaterial?.attachments.length ? (
                        classworkMaterial?.attachments.map((attachment) => (
                          <FileComponent key={attachment} fileId={attachment} />
                        ))
                      ) : (
                        <Typography>Không có tập tin</Typography>
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
                  className={classes.buttonTextColor}
                  onClick={pinRoomChat}
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
              <CreateComment roomId={id} />
            </CardContent>
          </SectionCard>
        </Grid>
      </PageContainer>
    )
  }

const useStyles = makeStyles(({ palette }) => ({
  root: {},
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

const WithPermissionDetailContentClassworkMaterial = () => (
  <WithAuth permission={Permission.Studying_Course_Access}>
    <DetailContentClassworkMaterial />
  </WithAuth>
)
export default WithPermissionDetailContentClassworkMaterial
