import { FC, useMemo, useState, useCallback } from 'react'

import { CardContent, Grid, Stack } from '@material-ui/core'
import AccountAvatar from 'components/AccountAvatar/AccountAvatar'
import AccountDisplayName from 'components/AccountDisplayName'
import CourseName from 'components/CourseName'
import FileComponent from 'components/FileComponent'
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
import {
  ClassworkAssignmentDetailDocument,
  Permission,
  useClassworkAssignmentDetailQuery,
  useRemoveAttachmentsFromClassworkAssignmentMutation,
  useListClassworkSubmissionQuery,
} from 'graphql/generated'
import UpdateClassworkAssignmentDialog from 'modules/UpdateClassworkAssignmentDialog/UpdateClassworkAssignmentDialog'
import {
  buildPath,
  TEACHING_COURSE_DETAIL_CLASSWORK_SUBMISSIONS,
} from 'utils/path-builder'

import AddAttachmentsToClassworkAssignment from './AddAttachmentsToClassworkAssignment'

export type ClassworkAssignmentDetailProps = {}

const data1 = {
  labels: ['Không nộp', 'Nộp muộn', 'Nộp đúng hạn'],
  datasets: [
    {
      label: '# of Votes',
      data: [12, 3, 5],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
      ],
      borderWidth: 1,
    },
  ],
}

const ClassworkAssignmentDetail: FC<ClassworkAssignmentDetailProps> = () => {
  const params: { id: string } = useParams()
  const id = useMemo(() => params.id, [params])
  const [openAddFile, setOpenAddFile] = useState(false)
  const { data, loading } = useClassworkAssignmentDetailQuery({
    variables: { id },
  })
  const { data: dataSubmissions } = useListClassworkSubmissionQuery({
    variables: { classworkAssignmentId: id },
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
      withBackButton
      maxWidth="lg"
      title={classworkAssignment.title}
      actions={[
        <Button onClick={handleOpenUpdateDialog} variant="contained">
          Sửa bài tập
        </Button>,
      ]}
    >
      <Grid container spacing={DASHBOARD_SPACING}>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 9 }}
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
                  <Pie data={data1} type="pie" />
                </div>
              </Grid>
            </Grid>
          </CardContent>
        </SectionCard>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 3 }}
          title="Sinh viên đã nộp"
          fullHeight={false}
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
    </PageContainer>
  )
}

const WithPermissionClassworkAssignmentDetail = () => (
  <WithAuth permission={Permission.Teaching_Course_Access}>
    <ClassworkAssignmentDetail />
  </WithAuth>
)

export default WithPermissionClassworkAssignmentDetail
