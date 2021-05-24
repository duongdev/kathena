/* eslint-disable react/jsx-props-no-spreading */
import { FC, useLayoutEffect, useMemo, useState } from 'react'

import { Box, Grid, makeStyles, Stack } from '@material-ui/core'
import clsx from 'clsx'
import { File } from 'phosphor-react'
import { useDropzone } from 'react-dropzone'

import Button from '../Button'
import withComponentHocs from '../hocs/withComponentHocs'
import Typography from '../Typography'

export type UploadInputProps = {
  maxFiles?: number
  accept?: string | string[]
  hideDropzoneOnNotEmpty?: boolean
  onChange?: (files: File[]) => void
}

const UploadInput: FC<UploadInputProps> = (props) => {
  const { maxFiles, accept, hideDropzoneOnNotEmpty, onChange } = props
  const classes = useStyles(props)
  const [files, setFiles] = useState<File[]>([])
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
          <Typography>Kéo và thả file vào đây hoặc</Typography>
          <Button variant="contained" color="inherit" onClick={open}>
            Chọn file
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
                <Preview file={file} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </div>
  )
}

type PreviewProps = {
  file: File
}

const Preview: FC<PreviewProps> = (props) => {
  const { file } = props
  const classes = useStyles(props)
  return (
    <Box className={classes.preview}>
      <File size={25} />
      {file.name} - {file.size}KB
    </Box>
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
  preview: {
    display: 'flex',
    alignItems: 'center',
  },
}))

export default withComponentHocs(UploadInput)
