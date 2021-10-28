import { FC, useCallback, useState } from 'react'

import { CardContent, Grid, IconButton, makeStyles, Stack } from '@material-ui/core'
import { useFormikContext } from 'formik'
import { useSnackbar } from 'notistack'
import { Trash } from 'phosphor-react'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { ANY } from '@kathena/types'
import {
  UploadInput,
  SectionCard,
  Spinner,
  TextFormField,
  Typography,
  EditorFormField,
  Button,
  ImagesUploadInput,
  InputField,
} from '@kathena/ui'
import InputFieldLabel from '@kathena/ui/InputField/InputFieldLabel'

import {
  ClassworkAssignmentFormInput,
  classworkAssignmentLabels as labels,
} from './CreateClassworkAssignment'

export type CreateClassworkAssignmentFormProps = {
  videos: ANY[],
  onChangeVideos: (value: ANY) => void
}

const CreateClassworkAssignmentForm: FC<CreateClassworkAssignmentFormProps> = (
  props,
) => {
  const { videos, onChangeVideos } = props
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const classes = useStyles(props)
  const { enqueueSnackbar } = useSnackbar()
  const formik = useFormikContext<ClassworkAssignmentFormInput>()
  const handleAttachmentsSelect = useCallback(
    (files: File[]) => {
      formik.setFieldValue('attachments', files ?? null)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const [title, setTitle] = useState<string>('')
  const [iframe, setIframe] = useState<string>('')
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [imageInput, setImageInput] = useState(true)

  const addVideo = () => {
    if (iframe.startsWith('<iframe') && iframe.endsWith('></iframe>')) {
      const arr = [...videos]
      const video = {
        title,
        iframe,
        thumbnail
      }
      arr.push(video)
      onChangeVideos(arr)
      setTitle('')
      setIframe('')
      setThumbnail(null)
      setImageInput(false)
      setTimeout(() => setImageInput(true), 300)
    } else {
      enqueueSnackbar('Vui lòng nhập đúng định dạng iframe', { variant: 'error' })
    }
  }

  const removeVideo = (index: number) => {
    const arr = [...videos]
    arr.splice(index, 1)
    onChangeVideos(arr)
  }

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
      <SectionCard
        maxContentHeight={false}
        gridItem={{ xs: 12, sm: 6 }}
        title='Danh sách video'
        fullHeight={false}
      >
        <CardContent className={classes.attachmentsCardContent}>
            {
              videos.map((item, index) => (
                <div style={{ display: 'flex', alignItems: 'center' }} key={item.title}>
                  <p>- Video {index + 1}: {item.title}</p>
                  <IconButton onClick={() => removeVideo(index)}>
                    <Trash/>
                  </IconButton>
                </div>
              ))
            }
            <Stack spacing={2} className={classes.inputWrapper}>
              <Stack>
                <InputFieldLabel>Tiêu đề:</InputFieldLabel>
                <InputField value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
              </Stack>
              <Stack>
                <InputFieldLabel>Iframe:</InputFieldLabel>
                <InputField value={iframe} onChange={(e) => setIframe(e.target.value)} fullWidth />
              </Stack>
              <Stack>
                <InputFieldLabel>Thumbnail:</InputFieldLabel>
                {imageInput && <ImagesUploadInput accept={['image/png', 'image/jpeg']} maxFiles={1} onChange={(files) => setThumbnail(files[0] ?? null)} />}
              </Stack>
              <Button onClick={addVideo} disabled={title === '' || iframe === '' || !thumbnail} style={{ marginTop: 20 }} variant='contained'>Thêm video</Button>
            </Stack>
        </CardContent>
      </SectionCard>
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
  inputWrapper:{
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '10px',
    border: '1px dashed #828282',
    padding: '20px'
  }
}))

export default CreateClassworkAssignmentForm
