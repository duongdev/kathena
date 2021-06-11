import { FC, useMemo, useState, useCallback } from 'react'

import { CardContent, Grid, makeStyles, Stack } from '@material-ui/core'
import FileComponent from 'components/FileComponent'
import PublicationChip from 'components/PublicationChip'
import format from 'date-fns/format'
import { useSnackbar } from 'notistack'
import { FilePlus, Trash } from 'phosphor-react'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { ANY } from '@kathena/types'
import {
  Button,
  InfoBlock,
  PageContainer,
  useDialogState,
  SectionCard,
  SectionCardSkeleton,
  Typography,
} from '@kathena/ui'
import { useAuth, RequiredPermission } from 'common/auth'
import {
  useDetailClassworkMaterialQuery,
  Permission,
  useRemoveAttachmentsFromClassworkMaterialMutation,
} from 'graphql/generated'
import AccountInfoRow from 'modules/StudyingCourse/Components/AccountInfoRow'

import AddAttachmentsToClassworkMaterial from './AddDeleteAttachmentClassworkMaterial/AddAttachmentClassworkMaterial'
import UpdateClassworkMaterialDialog from './UpdateClassworkMaterialsDialog'

export type DetailClassworkMaterialsProps = {}

const DetailClassworkMaterials: FC<DetailClassworkMaterialsProps> = (props) => {
  const classes = useStyles(props)
  const [updateDialogOpen, handleOpenUpdateDialog, handleCloseUpdateDialog] =
    useDialogState()
  const params: { id: string } = useParams()
  const id = useMemo(() => params.id, [params.id])
  const [openAddFile, setOpenAddFile] = useState(false)
  const { account } = useAuth()

  const { data, loading } = useDetailClassworkMaterialQuery({
    variables: { Id: id },
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
      withBackButton
      maxWidth="md"
      title={`${classworkMaterial?.title}`}
      subtitle={[
        <>
          <Grid container spacing={2} className={classes.root}>
            <InfoBlock gridItem={{ xs: 2 }} label="Ngày đăng:">
              {`${format(
                new Date(classworkMaterial?.createdAt),
                'dd/MM/yyyy',
              )}`}
            </InfoBlock>
            <InfoBlock gridItem={{ xs: 10 }} label="Người đăng:">
              <AccountInfoRow
                gridItem={{ xs: 4 }}
                key={`${account?.id}`}
                accountId={`${account?.id}`}
              />
            </InfoBlock>
          </Grid>
        </>,
      ]}
      actions={[
        <PublicationChip
          publication={classworkMaterial?.publicationState as ANY}
          variant="outlined"
          size="medium"
        />,
      ]}
    >
      <Grid container spacing={DASHBOARD_SPACING}>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 12 }}
          title="Thông tin tài liệu"
          action={[
            <Button onClick={handleOpenUpdateDialog} variant="contained">
              Sửa tài liệu
            </Button>,
          ]}
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
      </Grid>
    </PageContainer>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default DetailClassworkMaterials
