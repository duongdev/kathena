/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/jsx-props-no-spreading */
import { FC, useMemo } from 'react'

import { makeStyles, Skeleton } from '@material-ui/core'
import { File } from 'phosphor-react'

import { Typography } from '@kathena/ui'
import { useFileQuery } from 'graphql/generated'

export type FileComponentProps = {
  fileId: string
}
const FileComponent: FC<FileComponentProps> = (props) => {
  const { fileId, ...rest } = props
  const classes = useStyles(props)

  const { data, loading } = useFileQuery({ variables: { id: fileId } })
  const file = useMemo(() => data?.file, [data?.file])

  const skeleton = useMemo(
    () => (
      // eslint-disable-next-line react/void-dom-elements-no-children
      <div {...rest}>
        <Skeleton variant="rectangular" />
      </div>
    ),
    [rest],
  )

  if (loading) {
    return skeleton
  }

  const handleDownloadFile = () => {
    const xhr = new XMLHttpRequest()
    xhr.responseType = 'blob'
    xhr.onload = function onLoad() {
      const a = document.createElement('a')
      a.href = window.URL.createObjectURL(xhr.response)
      a.download = file?.name ?? 'download'
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
    xhr.open('GET', file?.signedUrl ?? '')
    xhr.send()
  }

  return (
    <div className={classes.root} onClick={handleDownloadFile}>
      <File size={24} />
      <Typography>{file?.name}</Typography>
    </div>
  )
}

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    alignContent: 'center',
    margin: '5px 10px',
    cursor: 'pointer',
  },
}))

export default FileComponent
