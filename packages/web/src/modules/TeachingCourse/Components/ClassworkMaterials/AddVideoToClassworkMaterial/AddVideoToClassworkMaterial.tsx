import { FC, useState } from 'react'

import { Grid, makeStyles, Stack } from '@material-ui/core'
import { useSnackbar } from 'notistack'

import { ANY } from '@kathena/types'
import {
  Button,
  ImagesUploadInput,
  InputField,
  renderApolloError,
} from '@kathena/ui'
import InputFieldLabel from '@kathena/ui/InputField/InputFieldLabel'
import {
  ClassworkMaterialsListDocument,
  useAddVideoToClassworkMaterialMutation,
} from 'graphql/generated'

export type AddVideoToClassworkMaterialProps = {
  idClassworkMaterial: string
  setOpen: ANY
}

const AddVideoToClassworkMaterial: FC<AddVideoToClassworkMaterialProps> = (
  props,
) => {
  const classes = useStyles(props)
  const { idClassworkMaterial } = props
  const { enqueueSnackbar } = useSnackbar()
  const [addVideoToClassworkMaterial] = useAddVideoToClassworkMaterialMutation({
    context: { hasFileUpload: true },
    refetchQueries: [
      {
        query: ClassworkMaterialsListDocument,
        variables: { id: idClassworkMaterial },
      },
    ],
  })
  const [title, setTitle] = useState<string>('')
  const [iframe, setIframe] = useState<string>('')
  const [thumbnail, setThumbnail] = useState<File | null>(null)

  const addVideo = async () => {
    if (iframe.startsWith('<iframe') && iframe.endsWith('></iframe>')) {
      try {
        const dataCreated = (
          await addVideoToClassworkMaterial({
            variables: {
              classworkMaterialId: idClassworkMaterial,
              videoInput: {
                video: {
                  iframe,
                  title,
                  thumbnail,
                },
              },
            },
          })
        ).data

        const classworkAssignment = dataCreated?.addVideoToClassworkMaterial

        if (!classworkAssignment) {
          return
        }
        enqueueSnackbar(`Thêm video vào tài liệu thành công`, {
          variant: 'success',
        })
        props.setOpen(false)
      } catch (error) {
        const errorMessage = renderApolloError(error)()
        enqueueSnackbar(errorMessage, { variant: 'error' })
        // eslint-disable-next-line no-console
        console.error(error)
      }
    } else {
      enqueueSnackbar('Vui lòng nhập đúng định dạng iframe', {
        variant: 'error',
      })
    }
  }

  return (
    <div className={classes.root}>
      <Grid container spacing={5}>
        <Grid item xs={6}>
          <Stack spacing={2}>
            <Stack>
              <InputFieldLabel>Tiêu đề:</InputFieldLabel>
              <InputField
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
              />
            </Stack>
            <Stack>
              <InputFieldLabel>Iframe:</InputFieldLabel>
              <InputField
                value={iframe}
                onChange={(e) => setIframe(e.target.value)}
                fullWidth
              />
            </Stack>
          </Stack>
        </Grid>
        <Grid item xs={6}>
          <Stack style={{ height: '100%' }}>
            <InputFieldLabel>Thumbnail:</InputFieldLabel>
            <ImagesUploadInput
              accept={['image/png', 'image/jpeg']}
              maxFiles={1}
              onChange={(files) => setThumbnail(files[0] ?? null)}
            />
          </Stack>
        </Grid>
      </Grid>
      <div
        style={{
          marginTop: 20,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Button
          onClick={addVideo}
          disabled={title === '' || iframe === '' || !thumbnail}
          style={{ width: '100px' }}
        >
          Thêm video
        </Button>
        <Button
          style={{ width: '100px' }}
          onClick={() => {
            props.setOpen(false)
          }}
        >
          Đóng
        </Button>
      </div>
    </div>
  )
}

const useStyles = makeStyles(() => ({
  root: {
    border: '1px dashed #828282',
    borderRadius: '10px',
    padding: '20px 20px 0px 20px',
    marginTop: 20,
  },
}))

export default AddVideoToClassworkMaterial
