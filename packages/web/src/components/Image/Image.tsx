import { FC } from 'react'

import { makeStyles, Skeleton } from '@material-ui/core'
import { useImage } from 'react-image'

import { useImageFileQuery } from 'graphql/generated'

export type ImageProps = {
  fileId: string
}

const Image: FC<ImageProps> = (props) => {
  const { fileId } = props
  const classes = useStyles(props)

  const { data, loading } = useImageFileQuery({ variables: { id: fileId } })
  const { src, isLoading } = useImage({
    srcList: 'https://www.example.com/foo.jpg',
  })

  if (loading || isLoading) {
    return <Skeleton />
  }

  return <div className={classes.root}>Image</div>
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default Image
