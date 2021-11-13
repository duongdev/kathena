/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/jsx-props-no-spreading */
import { FC, useMemo, ReactNode } from 'react'

import { makeStyles, Skeleton } from '@material-ui/core'
import { Download, File } from 'phosphor-react'

import { Typography } from '@kathena/ui'
import { useFileQuery } from 'graphql/generated'

export type FileComponentProps = {
  fileId: string
  withDowloadButton?: boolean
  actions?: ReactNode[]
}
const FileComponent: FC<FileComponentProps> = (props) => {
  const { fileId, withDowloadButton = true, actions, ...rest } = props
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
      a.download = file?.codeName ?? 'download'
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
    xhr.open('GET', file?.signedUrl ?? '')
    xhr.send()
  }

  return (
    <div className={classes.root}>
      <File size={24} />
      <Typography>{file?.name}</Typography>
      {withDowloadButton && (
        <Download
          size={24}
          style={{ margin: '0 10px', cursor: 'pointer' }}
          onClick={handleDownloadFile}
        />
      )}
      {actions?.length && actions.map((action) => action)}
    </div>
  )
}

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    margin: '5px 10px',
  },
}))

export default FileComponent
