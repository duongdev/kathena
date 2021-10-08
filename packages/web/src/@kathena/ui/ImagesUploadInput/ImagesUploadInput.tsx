/* eslint-disable react/jsx-props-no-spreading */
import { FC, useEffect, useLayoutEffect, useMemo, useState } from 'react'

import { Box, Grid, makeStyles, Stack } from '@material-ui/core'
import clsx from 'clsx'
import { useDropzone } from 'react-dropzone'

import Button from '../Button'
import withComponentHocs from '../hocs/withComponentHocs'
import Typography from '../Typography'

export type FileItem = File & { preview: string }

export type ImagesUploadInputProps = {
  maxFiles?: number
  accept?: string | string[]
  hideDropzoneOnNotEmpty?: boolean
  onChange?: (files: FileItem[]) => void
}

const ImagesUploadInput: FC<ImagesUploadInputProps> = (props) => {
  const { maxFiles, accept, hideDropzoneOnNotEmpty, onChange } = props
  const classes = useStyles(props)
  const [files, setFiles] = useState<FileItem[]>([])
  const { getRootProps, getInputProps, open, isDragAccept, isDragReject } =
    useDropzone({
      accept,
      maxFiles,
      noClick: true,
      noKeyboard: true,
      multiple: !maxFiles || !!(maxFiles && maxFiles > 1),
      onDrop: (acceptedDropFiles) => {
        setFiles(
          acceptedDropFiles.map((file) =>
            Object.assign(file, {
              preview: URL.createObjectURL(file),
            }),
          ),
        )
      },
    })

  const isEmpty = useMemo(() => files.length === 0, [files])

  useLayoutEffect(() => {
    onChange?.(files)
  }, [files, onChange])

  useEffect(
    () => () => {
      // Alt to componentWillUnmount.
      // Make sure to revoke the data uris to avoid memory leaks
      files.forEach((file) => URL.revokeObjectURL(file.preview))
    },
    [files],
  )

  return (
    <div className={classes.root}>
      {!(hideDropzoneOnNotEmpty && !isEmpty) && (
        <Stack
          spacing={2}
          className={classes.dropzone}
          {...getRootProps({
            className: clsx(classes.dropzone, {
              dragAccept: isDragAccept,
              dragEject: isDragReject,
            }),
          })}
        >
          <Typography>Kéo và thả ảnh vào đây hoặc</Typography>
          <Button variant="contained" color="inherit" onClick={open}>
            Chọn hình ảnh
          </Button>
          <input {...getInputProps()} />
        </Stack>
      )}

      {files.length > 0 && (
        <Box mt={2}>
          <Grid container spacing={2}>
            {files.map((file, idx) => (
              // eslint-disable-next-line react/no-array-index-key
              <Grid item key={idx}>
                <PreviewImageThumb file={file} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </div>
  )
}

type PreviewImageThumbProps = {
  file: FileItem
}

const PreviewImageThumb: FC<PreviewImageThumbProps> = (props) => {
  const { file } = props
  const classes = useStyles(props)

  return (
    <Box
      sx={{
        backgroundImage: `url(${file.preview})`,
        width: 80,
        height: 80,
        // borderRadius: 'shape.borderRadius',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      className={classes.previewImageItem}
    />
  )
}

const useStyles = makeStyles(({ spacing, palette, shape }) => ({
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  dropzone: {
    padding: spacing(2),
    alignItems: 'center',
    justifyContent: 'center',
    border: `dashed 2px ${palette.divider}`,
    borderRadius: shape.borderRadius,
    flex: 1,
    '&.dragAccept': {
      borderColor: palette.semantic.green,
    },
    '&.dragEject': {
      borderColor: palette.semantic.red,
    },
  },
  previewImageItem: {
    borderRadius: shape.borderRadius,
  },
}))

export default withComponentHocs(ImagesUploadInput)
