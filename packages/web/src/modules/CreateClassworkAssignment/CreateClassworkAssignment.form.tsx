import { FC, useCallback, useState } from 'react'

import { CardContent, Grid, IconButton, makeStyles, Stack } from '@material-ui/core'
import { useFormikContext } from 'formik'
import { Plus, X } from 'phosphor-react'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { ANY } from '@kathena/types'
import {
  UploadInput,
  SectionCard,
  Spinner,
  TextFormField,
  Typography,
  EditorFormField,
  InputField,
  Dialog,
  useDialogState,
  Button,
} from '@kathena/ui'
import InputFieldLabel from '@kathena/ui/InputField/InputFieldLabel'

import {
  ClassworkAssignmentFormInput,
  classworkAssignmentLabels as labels,
} from './CreateClassworkAssignment'
import kminLogo from './kmin-logo.png'

export type CreateClassworkAssignmentFormProps = {
  iframeVideos: string[]
  addIframe: (iframe: string) => void
  removeIframe: (index: number) => void
}

const CreateClassworkAssignmentForm: FC<CreateClassworkAssignmentFormProps> = (
  props,
) => {
  const { iframeVideos, addIframe, removeIframe } = props
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const classes = useStyles(props)
  const formik = useFormikContext<ClassworkAssignmentFormInput>()
  const [input, setInput] = useState<string>('')
  const [
    open,
    handleOpenDialog,
    handleCloseDialog,
  ] = useDialogState()
  const [currentIndex, setCurrentIndex] = useState(0)
  const handleAttachmentsSelect = useCallback(
    (files: File[]) => {
      formik.setFieldValue('attachments', files ?? null)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return (
    <Grid container spacing={DASHBOARD_SPACING}>
      <SectionCard
        maxContentHeight={false}
        gridItem={{ xs: 12, sm: 6 }}
        title="Thông tin bài tập"
      >
        <CardContent>
          <Stack spacing={2}>
            <TextFormField
              required
              autoFocus
              name="title"
              label={labels.title}
            />
            <EditorFormField required name="description" label="Mô Tả" />
            <TextFormField
              type="date"
              required
              name="dueDate"
              label={labels.dueDate}
            />
            <InputFieldLabel>Danh sách iframe video: </InputFieldLabel>
            <div className={classes.iframeContainer}>
              {
                iframeVideos.map((item, index) => (
                  <div onClick={() => {
                    handleOpenDialog()
                    setCurrentIndex(index)
                  }} className={classes.iframeWrapper}>
                    <img style={{ borderRadius: '5px' }} src={kminLogo} title={item} alt="Video" width={50} height={50} />
                    <div onClick={(e) => {
                      e.stopPropagation()
                      removeIframe(index)
                    }} className={classes.removeWrapper} >
                      <X width={14} />
                    </div>
                  </div>
                ))
              }
            </div>
            <div style={{ display: 'flex' }}>
              <InputField
                fullWidth
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <IconButton onClick={() => {
                if (input !== '') {
                  addIframe(input)
                  setInput('')
                }
              }}>
                <Plus />
              </IconButton>
            </div>
          </Stack>
        </CardContent>
      </SectionCard>
      <SectionCard
        maxContentHeight={false}
        gridItem={{ xs: 12, sm: 6 }}
        title={labels.attachments}
        classes={{ root: classes.attachmentsCard }}
        fullHeight={false}
      >
        {formik.isSubmitting && <Spinner container="overlay" />}
        <CardContent className={classes.attachmentsCardContent}>
          <UploadInput
            // accept={['image/png', 'image/jpeg']}
            onChange={handleAttachmentsSelect}
          />
          {formik.submitCount > 0 && formik.errors.attachments && (
            <Typography color="error" className={classes.attachmentsError}>
              {formik.errors.attachments}
            </Typography>
          )}
        </CardContent>
      </SectionCard>
      <Dialog open={open} onClose={handleCloseDialog} extraDialogActions={<Button variant='contained' onClick={() => {
        handleCloseDialog()
        removeIframe(currentIndex)
        setCurrentIndex(0)
      }}>Xóa</Button>} >
        <div
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: iframeVideos[currentIndex] as ANY }}
        />
      </Dialog>
    </Grid>
  )
}

const useStyles = makeStyles(({ spacing }) => ({
  root: {},
  attachmentsCard: {
    position: 'relative',
  },
  attachmentsCardContent: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '250px',
  },
  attachmentsError: {
    marginTop: spacing(2),
    flexShrink: 0,
    display: 'block',
  },
  iframeContainer: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  iframeWrapper: {
    margin: '10px 10px 0px 0px',
    position: 'relative',
    cursor: 'pointer'
  },
  removeWrapper: {
    position: 'absolute',
    right: '-6px',
    top: '-6px',
    cursor: 'pointer',
    width: 18,
    height: 18,
    background: '#f2f2f2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%'
  }
}))

export default CreateClassworkAssignmentForm
