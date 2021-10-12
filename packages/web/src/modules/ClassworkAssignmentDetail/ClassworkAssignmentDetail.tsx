import { FC, useMemo, useState, useCallback, useEffect } from 'react'

import { CardContent, Grid, Stack } from '@material-ui/core'
import AccountAvatar from 'components/AccountAvatar/AccountAvatar'
import AccountDisplayName from 'components/AccountDisplayName'
import Comment from 'components/Comment/Comment'
import CourseName from 'components/CourseName'
import FileComponent from 'components/FileComponent'
import VideoPopup from 'components/VideoPopup'
import { useSnackbar } from 'notistack'
import { FilePlus, Trash } from 'phosphor-react'
import { Pie } from 'react-chartjs-2'
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
  useDialogState,
} from '@kathena/ui'
import { RequiredPermission, WithAuth } from 'common/auth'
import { listRoomChatVar } from 'common/cache'
import {
  ClassworkAssignmentDetailDocument,
  Permission,
  useClassworkAssignmentDetailQuery,
  useRemoveAttachmentsFromClassworkAssignmentMutation,
  useListClassworkSubmissionQuery,
  useConversationsQuery,
  useConversationCreatedSubscription,
  Conversation as CommentModel,
  ConversationType,
  useSubmissionStatusStatisticsQuery,
  Publication,
  useUpdateClassworkAssignmentPublicationMutation,
} from 'graphql/generated'
import CreateComment from 'modules/CreateComment'
import UpdateClassworkAssignmentDialog from 'modules/UpdateClassworkAssignmentDialog/UpdateClassworkAssignmentDialog'
import {
  buildPath,
  TEACHING_COURSE_CLASSWORK_ASSIGNMENTS,
  TEACHING_COURSE_DETAIL_CLASSWORK_SUBMISSIONS,
} from 'utils/path-builder'

import AddAttachmentsToClassworkAssignment from './AddAttachmentsToClassworkAssignment'
import kminLogo from './kmin-logo.png'

export type ClassworkAssignmentDetailProps = {}

const ClassworkAssignmentDetail: FC<ClassworkAssignmentDetailProps> = () => {
  const params: { id: string } = useParams()
  const id = useMemo(() => params.id, [params])
  const [openAddFile, setOpenAddFile] = useState(false)
  const [lastId, setLastId] = useState<string | null>(null)
  const [comments, setComments] = useState<CommentModel[]>([])
  const [totalComment, setTotalComment] = useState(0)
  const [openVideo, handleOpenVideoDialog, handleCloseVideoDialog] =
    useDialogState()
  const [indexVideo, setIndexVideo] = useState(0)
  const { data, loading } = useClassworkAssignmentDetailQuery({
    variables: { id },
  })
  const { data: dataSubmissions } = useListClassworkSubmissionQuery({
    variables: { classworkAssignmentId: id },
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

  const { data: dataSubmissionStatus } = useSubmissionStatusStatisticsQuery({
    variables: { id },
  })
  const [removeAttachmentsFromClassworkAssignment] =
    useRemoveAttachmentsFromClassworkAssignmentMutation({
      refetchQueries: [
        {
          query: ClassworkAssignmentDetailDocument,
          variables: {
            id,
          },
        },
      ],
    })
  const { enqueueSnackbar } = useSnackbar()

  const classworkAssignment = useMemo(() => data?.classworkAssignment, [data])

  const classworkSubmissions = useMemo(
    () => dataSubmissions?.classworkSubmissions,
    [dataSubmissions],
  )

  const classworkSubmissionChart = useMemo(() => {
    const arr = dataSubmissionStatus?.submissionStatusStatistics ?? []
    const labels: ANY[] = []
    const numbers: ANY[] = []
    // eslint-disable-next-line
    arr.map((item) => {
      if (item.label === 'On Time') {
        labels.push('Nộp đúng hạn')
        numbers.push(item.number)
      } else if (item.label === 'Late') {
        labels.push('Nộp muộn')
        numbers.push(item.number)
      } else {
        labels.push('Chưa nộp')
        numbers.push(item.number)
      }
    })

    const data1 = {
      labels,
      datasets: [
        {
          label: '# of Votes',
          data: numbers,
          backgroundColor: [
            'rgba(75, 192, 192, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(255, 99, 132, 0.2)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1,
        },
      ],
    }

    return data1
  }, [dataSubmissionStatus?.submissionStatusStatistics])

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

  const [updateDialogOpen, handleOpenUpdateDialog, handleCloseUpdateDialog] =
    useDialogState()

  const removeAttachment = useCallback(
    async (attachmentId: string) => {
      if (!classworkAssignment) return
      try {
        const dataCreated = (
          await removeAttachmentsFromClassworkAssignment({
            variables: {
              classworkAssignmentId: classworkAssignment.id,
              attachments: [attachmentId],
            },
          })
        ).data

        const classworkAssignmentUpdated =
          dataCreated?.removeAttachmentsFromClassworkAssignments

        if (!classworkAssignmentUpdated) {
          return
        }
        enqueueSnackbar(`Xóa file thành công`, {
          variant: 'success',
        })
        // eslint-disable-next-line no-console
        console.log(classworkAssignment)
      } catch (error) {
        enqueueSnackbar(error, { variant: 'error' })
        // eslint-disable-next-line no-console
        console.error(error)
      }
    },
    [
      removeAttachmentsFromClassworkAssignment,
      enqueueSnackbar,
      classworkAssignment,
    ],
  )

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
  const [updateAssignmentPublication] =
    useUpdateClassworkAssignmentPublicationMutation({
      refetchQueries: [
        {
          query: ClassworkAssignmentDetailDocument,
          variables: { id },
        },
      ],
    })
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

  const updatePublication = async (publicationState: Publication) => {
    const updated = await updateAssignmentPublication({
      variables: {
        id,
        publication: publicationState,
      },
    })
    if (updated) {
      enqueueSnackbar(`Cập nhật thành công`, { variant: 'success' })
    } else {
      enqueueSnackbar(`Cập nhật thất bại`, { variant: 'error' })
    }
  }
  return (
    <PageContainer
      backButtonLabel="Danh sách bài tập"
      withBackButton={buildPath(TEACHING_COURSE_CLASSWORK_ASSIGNMENTS, {
        id: classworkAssignment.courseId,
      })}
      maxWidth="lg"
      title={classworkAssignment.title}
      actions={[
        <Button
          onClick={() =>
            updatePublication(
              classworkAssignment.publicationState === Publication.Draft
                ? Publication.Published
                : Publication.Draft,
            )
          }
          variant="contained"
        >
          {classworkAssignment.publicationState === Publication.Draft
            ? 'Public'
            : 'Draft'}
        </Button>,
        <Button onClick={handleOpenUpdateDialog} variant="contained">
          Sửa bài tập
        </Button>,
      ]}
    >
      <Grid container spacing={DASHBOARD_SPACING}>
        <Grid item xs={9} container spacing={DASHBOARD_SPACING}>
          <SectionCard
            maxContentHeight={false}
            gridItem={{ xs: 12 }}
            title="Thông tin bài tập"
          >
            <RequiredPermission
              permission={Permission.Classwork_UpdateClassworkAssignment}
            >
              <UpdateClassworkAssignmentDialog
                open={updateDialogOpen}
                onClose={handleCloseUpdateDialog}
                classworkAssignment={classworkAssignment}
              />
            </RequiredPermission>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={7}>
                  <Stack spacing={2}>
                    <InfoBlock label="Tiêu đề">
                      {classworkAssignment.title}
                    </InfoBlock>
                    <InfoBlock label="Khóa học">
                      <CourseName courseId={classworkAssignment.courseId} />
                    </InfoBlock>
                    <InfoBlock label="Mô tả">
                      <div
                        // eslint-disable-next-line
                        dangerouslySetInnerHTML={{
                          __html: classworkAssignment.description as ANY,
                        }}
                      />
                    </InfoBlock>
                    {classworkAssignment.iframeVideos.length > 0 && (
                      <InfoBlock label="Danh sách video">
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                          {classworkAssignment.iframeVideos.map(
                            (_item, index) => (
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
                            ),
                          )}
                        </div>
                      </InfoBlock>
                    )}
                    <InfoBlock label="Tập tin đính kèm">
                      {classworkAssignment.attachments.length ? (
                        classworkAssignment.attachments.map((attachment) => (
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
                    {!openAddFile && (
                      <Button
                        onClick={() => setOpenAddFile(true)}
                        startIcon={<FilePlus />}
                      >
                        Thêm tập tin
                      </Button>
                    )}
                    {openAddFile && (
                      <AddAttachmentsToClassworkAssignment
                        idClassworkAssignment={classworkAssignment.id}
                        setOpen={setOpenAddFile}
                      />
                    )}
                  </Stack>
                </Grid>
                <Grid
                  item
                  xs={5}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Typography>Tỷ lệ nộp bài</Typography>
                  <div>
                    <Pie data={classworkSubmissionChart} type="pie" />
                  </div>
                </Grid>
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
        <SectionCard
          gridItem={{ xs: 3 }}
          title="Học viên đã nộp"
          fullHeight={false}
          action={[
            <>
              <InfoBlock label="Số lượng nộp:">
                <Typography align="right">
                  {' '}
                  {classworkSubmissions?.length}
                </Typography>
              </InfoBlock>
            </>,
          ]}
        >
          <CardContent>
            {classworkSubmissions?.length ? (
              classworkSubmissions.map((classworkSubmission) => (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '5px',
                  }}
                >
                  <AccountAvatar
                    accountId={classworkSubmission.createdByAccountId}
                  />
                  <Link
                    style={{ marginLeft: '10px' }}
                    to={buildPath(
                      TEACHING_COURSE_DETAIL_CLASSWORK_SUBMISSIONS,
                      { id: classworkSubmission.id },
                    )}
                  >
                    <AccountDisplayName
                      style={{ cursor: 'pointer' }}
                      accountId={classworkSubmission.createdByAccountId}
                    />
                  </Link>
                </div>
              ))
            ) : (
              <Typography>Chưa có học viên nộp bài</Typography>
            )}
          </CardContent>
        </SectionCard>
      </Grid>
      <VideoPopup
        iframeVideos={classworkAssignment.iframeVideos}
        index={indexVideo}
        open={openVideo}
        onClose={handleCloseVideoDialog}
      />
    </PageContainer>
  )
}

const WithPermissionClassworkAssignmentDetail = () => (
  <WithAuth permission={Permission.Teaching_Course_Access}>
    <ClassworkAssignmentDetail />
  </WithAuth>
)

export default WithPermissionClassworkAssignmentDetail
