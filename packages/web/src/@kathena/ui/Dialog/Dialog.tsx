/* eslint-disable react/jsx-props-no-spreading */
import { ReactNode, useCallback } from 'react'

import {
  Dialog as DialogMUI,
  DialogActions as DialogActionsMUI,
  DialogContent as DialogContentMUI,
  DialogTitle as DialogTitleMUI,
  makeStyles,
  Theme,
} from '@material-ui/core'

import { ANY } from '../../types'
import Button from '../Button'

export type DialogProps = {
  open: boolean
  dialogTitle?: string | React.ReactNode
  extraDialogActions?: ReactNode
  onClose: () => ANY
  width?: number | string
  classes?: Partial<Record<'dialogPaper', string>>
  children?: React.ReactNode
}

const Dialog = (props: DialogProps) => {
  const { open, dialogTitle, extraDialogActions, children, onClose } = props
  const classes = useStyles(props)

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  return (
    <DialogMUI
      open={open}
      onClose={handleClose}
      scroll="paper"
      classes={{ paper: classes.dialogPaper }}
    >
      {dialogTitle && <DialogTitleMUI>{dialogTitle}</DialogTitleMUI>}
      <>
        <DialogContentMUI>{children}</DialogContentMUI>
        <DialogActionsMUI>
          {extraDialogActions}
          <Button onClick={handleClose} type="button">
            Đóng
          </Button>
        </DialogActionsMUI>
      </>
    </DialogMUI>
  )
}

const useStyles = makeStyles<Theme, DialogProps, 'dialogPaper'>(() => ({
  dialogPaper: {
    maxWidth: '95vw',
    width: ({ width }) => width,
  },
}))

export default Dialog
