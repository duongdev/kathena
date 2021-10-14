import { FC, MouseEvent, useCallback, useMemo, useState } from 'react'

import { IconButton, makeStyles, Popover } from '@material-ui/core'
import AccountAvatar from 'components/AccountAvatar/AccountAvatar'
import CurrentAccountMenu from 'components/CurrentAccountMenu'

import { withComponentHocs } from '@kathena/ui'
import { useAuth } from 'common/auth'

export type AccountAvatarMenuProps = {}

const AccountAvatarMenu: FC<AccountAvatarMenuProps> = (props) => {
  const classes = useStyles(props)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const { account } = useAuth()

  const handleClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }, [])

  const handleClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const open = useMemo(() => Boolean(anchorEl), [anchorEl])
  const id = useMemo(() => (open ? 'simple-popover' : undefined), [open])

  if (!account) return null

  return (
    <div className={classes.root}>
      <IconButton size="small" onClick={handleClick}>
        <AccountAvatar accountId={account.id} />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <CurrentAccountMenu onClose={handleClose} />
      </Popover>
    </div>
  )
}

const useStyles = makeStyles(() => ({
  root: {
    zIndex: 50,
    border: '2px solid #ffff',
    borderRadius: '50%',
  },
}))

export default withComponentHocs(AccountAvatarMenu)
