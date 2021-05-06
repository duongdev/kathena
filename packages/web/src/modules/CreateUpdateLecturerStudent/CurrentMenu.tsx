import { FC, useCallback } from 'react'

import { List, ListItem, ListItemText, makeStyles } from '@material-ui/core'

export type CurrentMenuProps = {
  onClose?: () => void
}

const CurrentMenu: FC<CurrentMenuProps> = (props) => {
  const { onClose } = props
  const classes = useStyles(props)

  const handleClickAndClose = useCallback(() => {
    onClose?.()
  }, [onClose])

  return (
    <List className={classes.root} dense>
      <ListItem button onClick={handleClickAndClose}>
        <ListItemText>Email</ListItemText>
      </ListItem>
      <ListItem button onClick={handleClickAndClose}>
        <ListItemText>Xóa</ListItemText>
      </ListItem>
    </List>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default CurrentMenu
