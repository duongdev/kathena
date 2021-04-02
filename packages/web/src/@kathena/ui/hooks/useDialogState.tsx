import { useCallback, useState } from 'react'

export const useDialogState = (
  initialOpen: boolean | (() => boolean) = false,
): [boolean, () => void, () => void] => {
  const [open, setOpen] = useState(initialOpen)

  const handleOpen = useCallback(() => setOpen(true), [])
  const handleClose = useCallback(() => setOpen(false), [])

  return [open, handleOpen, handleClose]
}
