import { FC, useMemo, useState, useCallback } from 'react'

import { CardContent, Grid, Stack } from '@material-ui/core'
import CourseName from 'components/CourseName'
import FileComponent from 'components/FileComponent'
import { useSnackbar } from 'notistack'
import { FilePlus, Trash } from 'phosphor-react'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { ANY } from '@kathena/types'
import {
  Button,
  InfoBlock,
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
} from 'graphql/generated'
import UpdateClassworkAssignmentDialog from 'modules/UpdateClassworkAssignmentDialog/UpdateClassworkAssignmentDialog'

import AddAttachmentsToClassworkAssignment from './AddAttachmentsToClassworkAssignment'

export type ClassworkAssignmentDetailProps = {}

const ClassworkAssignmentDetail: FC<ClassworkAssignmentDetailProps> = () => {
  const params: { id: string } = useParams()
  const id = useMemo(() => params.id, [params])
  const [openAddFile, setOpenAddFile] = useState(false)
  const { data, loading } = useClassworkAssignmentDetailQuery({
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
              <Grid item xs={12}>
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
            </Grid>
          </CardContent>
        </SectionCard>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 3 }}
          title="Sinh viên đã nộp"
        >
          <CardContent>Render tại đây</CardContent>
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
