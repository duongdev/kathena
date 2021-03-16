import { FC, useCallback } from 'react'

import {
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
} from '@material-ui/core'
import { Briefcase, SignOut, UserCircleGear } from 'phosphor-react'
// eslint-disable-next-line no-restricted-imports
import { Link } from 'react-router-dom'

import { useAuth } from 'common/auth'
import { buildPath, USER_PROFILE, USER_SELF_SETTINGS } from 'utils/path-builder'

export type CurrentAccountMenuProps = {
  onClose?: () => void
}

const CurrentAccountMenu: FC<CurrentAccountMenuProps> = (props) => {
  const { onClose } = props
  const classes = useStyles(props)
  const { signOut, $account: account } = useAuth()

  const handleClickAndClose = useCallback(() => {
    onClose?.()
  }, [onClose])

  return (
    <List className={classes.root} dense>
      <ListItem
        button
        component={Link}
        to={buildPath(USER_PROFILE, { username: account.username })}
        onClick={handleClickAndClose}
      >
        <ListItemIcon className={classes.listItemIcon}>
          <Briefcase />
        </ListItemIcon>
        <ListItemText>Hồ sơ cá nhân</ListItemText>
      </ListItem>
      <ListItem
        button
        component={Link}
        to={USER_SELF_SETTINGS}
        onClick={handleClickAndClose}
      >
        <ListItemIcon className={classes.listItemIcon}>
          <UserCircleGear />
        </ListItemIcon>
        <ListItemText>Cài đặt tài khoản</ListItemText>
      </ListItem>
      <Divider />
      <ListItem button onClick={signOut}>
        <ListItemIcon className={classes.listItemIcon}>
          <SignOut />
        </ListItemIcon>
        <ListItemText>Đăng xuất</ListItemText>
      </ListItem>
    </List>
  )
}

const useStyles = makeStyles(({ spacing }) => ({
  root: {},
  listItemIcon: {
    minWidth: 'unset',
    marginRight: spacing(2),
  },
}))

export default CurrentAccountMenu
