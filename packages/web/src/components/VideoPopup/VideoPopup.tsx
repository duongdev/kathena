import { FC, useState } from 'react'

import { ANY } from '@kathena/types'
import { Dialog, Button } from '@kathena/ui'

export type VideoPopupProps = {
  open: boolean
  onClose: () => void
  iframeVideos: string[]
  index: number
}

const VideoPopup: FC<VideoPopupProps> = (props) => {
  const { open, onClose, iframeVideos, index: indexProps } = props
  const [index, setIndex] = useState(indexProps)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      extraDialogActions={
        <>
          <Button
            disabled={index === 0}
            onClick={() => setIndex((state) => state - 1)}
          >
            Previous
          </Button>
          <Button
            disabled={iframeVideos.length === index + 1}
            onClick={() => setIndex((state) => state + 1)}
          >
            Next
          </Button>
        </>
      }
    >
      <div style={{ position: 'relative' }}>
        <div
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: iframeVideos[index] as ANY }}
        />
      </div>
    </Dialog>
  )
}
export default VideoPopup
