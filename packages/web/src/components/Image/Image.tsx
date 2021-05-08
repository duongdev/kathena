/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/jsx-props-no-spreading */
import {
  FC,
  HTMLAttributes,
  ImgHTMLAttributes,
  Suspense,
  useMemo,
  ReactNode,
} from 'react'

import { makeStyles, Skeleton } from '@material-ui/core'
import { useImage } from 'react-image'

import { ANY } from '@kathena/types'
import { useImageFileQuery } from 'graphql/generated'

import ImgNotFound from './NotFound.jpg'

export type ImageProps = {
  fileId: string
  variant?: 'img' | 'background'
  actions?: ReactNode[]
} & Partial<
  ImgHTMLAttributes<HTMLImageElement> | HTMLAttributes<HTMLDivElement>
>

const Image: FC<ImageProps> = (props) => {
  const { fileId, ...rest } = props
  const classes = useStyles(props)

  const { data, loading } = useImageFileQuery({ variables: { id: fileId } })

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

  return (
    <Suspense fallback={skeleton}>
      <ImageComponent
        signedUrl={data?.file?.signedUrl ?? '/'}
        alt={data?.file?.name ?? fileId}
        className={classes.root}
        {...rest}
      />
    </Suspense>
  )
}

const ImageComponent = (props: ANY) => {
  const { signedUrl, alt, variant, actions, ...rest } = props
  const classes = useStyles(props)
  const { src } = useImage({
    srcList: [signedUrl ?? '', ImgNotFound],
  })

  if (!variant || variant === 'img')
    return <img src={src} alt={alt} {...rest} />
  return (
    <div
      {...rest}
      style={{
        backgroundImage: `url("${src}")`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
        position: 'relative',
        ...rest.style,
      }}
    >
      <div className={classes.actionsWrapper}>
        {actions && actions.map((action: ReactNode) => action)}
      </div>
    </div>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
  actionsWrapper: {
    position: 'absolute',
    bottom: -30,
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
}))

export default Image
