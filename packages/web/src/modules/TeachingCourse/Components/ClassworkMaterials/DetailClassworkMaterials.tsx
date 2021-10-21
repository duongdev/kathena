import { FC, useCallback, useEffect, useMemo, useState } from 'react'

import { CardContent, Grid, makeStyles, Stack } from '@material-ui/core'
import Comment from 'components/Comment/Comment'
import FileComponent from 'components/FileComponent'
import VideoPopup from 'components/VideoPopup'
import { useSnackbar } from 'notistack'
import { FilePlus, Trash } from 'phosphor-react'
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
  useDialogState,
} from '@kathena/ui'
import { RequiredPermission, useAuth, WithAuth } from 'common/auth'
import { listRoomChatVar } from 'common/cache'
import {
  ClassworkMaterialsListDocument,
  Conversation as ConversationModel,
  ConversationType,
  Permission,
  Publication,
  useConversationCreatedSubscription,
  useConversationsQuery,
  useDetailClassworkMaterialQuery,
  useRemoveAttachmentsFromClassworkMaterialMutation,
  useUpdateClassworkMaterialPublicationMutation,
} from 'graphql/generated'
import CreateComment from 'modules/CreateComment'
import {
  buildPath,
  TEACHING_COURSE_CLASSWORK_MATERIALS,
} from 'utils/path-builder'

import AddAttachmentsToClassworkMaterial from './AddDeleteAttachmentClassworkMaterial/AddAttachmentClassworkMaterial'
import kminLogo from './kmin-logo.png'
import UpdateClassworkMaterialDialog from './UpdateClassworkMaterialsDialog'

export type DetailClassworkMaterialsProps = {}

const DetailClassworkMaterials: FC<DetailClassworkMaterialsProps> = (props) => {
  const classes = useStyles(props)

  const [updateDialogOpen, handleOpenUpdateDialog, handleCloseUpdateDialog] =
    useDialogState()
  const params: { id: string } = useParams()
  const { $org: org } = useAuth()
  const id = useMemo(() => params.id, [params.id])
  const [openAddFile, setOpenAddFile] = useState(false)
  const [lastId, setLastId] = useState<string | null>(null)
  const [comments, setComments] = useState<ConversationModel[]>([])
  const [totalComment, setTotalComment] = useState(0)
  // Xem Popup video
  const [openVideo, handleOpenVideoDialog, handleCloseVideoDialog] =
    useDialogState()
  const [indexVideo, setIndexVideo] = useState(0)
  // -----------------
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
  const classworkMaterial = useMemo(() => data?.classworkMaterial, [data])
  const [removeAttachmentsFromClassworkMaterial] =
    useRemoveAttachmentsFromClassworkMaterialMutation()
  const { enqueueSnackbar } = useSnackbar()

  const removeAttachment = useCallback(
    async (attachmentId: string) => {
      if (!classworkMaterial) return
      try {
        const dataCreated = (
          await removeAttachmentsFromClassworkMaterial({
            variables: {
              classworkMaterialId: classworkMaterial.id,
              attachments: [attachmentId],
            },
          })
        ).data

        const classworkMaterialsUpdated =
          dataCreated?.removeAttachmentsFromClassworkMaterial

        if (!classworkMaterialsUpdated) {
          return
        }
        enqueueSnackbar(`Xóa tập tin thành công`, {
          variant: 'success',
        })
        // eslint-disable-next-line no-console
        console.log(classworkMaterial)
      } catch (error) {
        enqueueSnackbar(error, { variant: 'error' })
        // eslint-disable-next-line no-console
        console.error(error)
      }
    },
    [
      removeAttachmentsFromClassworkMaterial,
      enqueueSnackbar,
      classworkMaterial,
    ],
  )

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
  const [updateMaterialPublication] =
    useUpdateClassworkMaterialPublicationMutation({
      refetchQueries: [
        {
          query: ClassworkMaterialsListDocument,
          variables: {
            orgId: org.id,
            skip: 0,
            limit: 10,
            courseId: classworkMaterial?.courseId,
          },
        },
      ],
    })
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
  const updatePublication = async (publicationState: Publication) => {
    const updated = await updateMaterialPublication({
      variables: {
        publicationState,
        classworkMaterialId: classworkMaterial?.id as ANY,
      },
    })
    if (updated) {
      enqueueSnackbar(
        `Cập nhật thành ${
          classworkMaterial?.publicationState === Publication.Draft
            ? 'bản công khai'
            : 'bản nháp'
        }`,
        { variant: 'success' },
      )
    } else {
      enqueueSnackbar(`Cập nhật thất bại`, { variant: 'error' })
    }
  }
  return (
    <PageContainer
      backButtonLabel="Danh sách tài liệu"
      withBackButton={buildPath(TEACHING_COURSE_CLASSWORK_MATERIALS, {
        id: classworkMaterial?.courseId as ANY,
      })}
      maxWidth="md"
      title={`${classworkMaterial?.title}`}
      actions={[
        <Button
          backgroundColorButton="primary"
          onClick={() =>
            updatePublication(
              classworkMaterial?.publicationState === Publication.Draft
                ? Publication.Published
                : Publication.Draft,
            )
          }
          variant="contained"
        >
          {classworkMaterial?.publicationState === Publication.Draft
            ? 'Bản nháp'
            : 'Công khai'}
        </Button>,
        <Button
          backgroundColorButton="primary"
          onClick={handleOpenUpdateDialog}
          variant="contained"
        >
          Sửa tài liệu
        </Button>,
      ]}
    >
      <Grid container spacing={DASHBOARD_SPACING}>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 12 }}
          title="Thông tin tài liệu"
        >
          <RequiredPermission
            permission={Permission.Classwork_UpdateClassworkMaterial}
          >
            <UpdateClassworkMaterialDialog
              open={updateDialogOpen}
              onClose={handleCloseUpdateDialog}
              classworkMaterial={classworkMaterial as ANY}
            />
          </RequiredPermission>
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
                  {(classworkMaterial?.iframeVideos.length as ANY) > 0 && (
                    <InfoBlock label="Danh sách video">
                      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {classworkMaterial?.iframeVideos.map((_item, index) => (
                          <div
                            onClick={() => {
                              setIndexVideo(index)
                              handleOpenVideoDialog()
                            }}
                            style={{
                              margin: '10px 10px 0px 0px',
                              cursor: 'pointer',
                            }}
                          >
                            <img
                              style={{ borderRadius: '10px' }}
                              src={kminLogo}
                              width={60}
                              height={60}
                              alt="video"
                            />
                          </div>
                        ))}
                      </div>
                    </InfoBlock>
                  )}
                  <InfoBlock label="Tập tin đính kèm: ">
                    {classworkMaterial?.attachments.length ? (
                      classworkMaterial?.attachments.map((attachment) => (
                        <FileComponent
                          key={attachment}
                          fileId={attachment}
                          actions={[
                            <Trash
                              onClick={() => removeAttachment(attachment)}
                              style={{ cursor: 'pointer' }}
                              size={24}
                            />,
                          ]}
                        />
                      ))
                    ) : (
                      <Typography>Không có tập tin</Typography>
                    )}
                  </InfoBlock>
                </Stack>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Stack spacing={2}>
                    {!openAddFile && (
                      <Button
                        onClick={() => setOpenAddFile(true)}
                        startIcon={<FilePlus />}
                      >
                        Thêm tập tin
                      </Button>
                    )}
                    {openAddFile && (
                      <AddAttachmentsToClassworkMaterial
                        idClassworkMaterial={classworkMaterial?.id as ANY}
                        setOpen={setOpenAddFile}
                      />
                    )}
                  </Stack>
                </Grid>
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
            <CreateComment roomId={id} />
          </CardContent>
        </SectionCard>
      </Grid>
      <VideoPopup
        iframeVideos={classworkMaterial?.iframeVideos as ANY}
        index={indexVideo}
        open={openVideo}
        onClose={handleCloseVideoDialog}
      />
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
  <WithAuth permission={Permission.Teaching_Course_Access}>
    <DetailClassworkMaterials />
  </WithAuth>
)
export default WithPermissionDetailContentClassworkMaterial
