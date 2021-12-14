import { FC, useEffect, useState } from 'react'

import { ANY } from '@kathena/types'
import { Dialog, Button, Typography } from '@kathena/ui'

export type VideoPopupProps = {
  open: boolean
  onClose: () => void
  videos: ANY[]
  index: number
}

const VideoPopup: FC<VideoPopupProps> = (props) => {
  const { open, onClose, videos, index: indexProps } = props
  const [index, setIndex] = useState(indexProps)

  useEffect(() => {
    setIndex(indexProps)
  }, [indexProps])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      right="3.4em"
      extraDialogActions={
        <div style={{ justifyContent: 'space-between' }}>
          <Button
            disabled={index === 0}
            onClick={() => setIndex((state) => state - 1)}
          >
            Previous
          </Button>
          <Button
            disabled={videos.length === index + 1}
            onClick={() => setIndex((state) => state + 1)}
          >
            Next
          </Button>
        </div>
      }
    >
      <div
        style={{
          position: 'relative',
          padding: '0 2em 0 2em',
        }}
      >
        <Typography variant="h3" style={{ marginBottom: 10 }}>
          {videos[index].title}
        </Typography>

        <div
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: videos[index].iframe as ANY }}
        />
      </div>
    </Dialog>
  )
}
export default VideoPopup
