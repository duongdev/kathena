import { FC, useMemo } from 'react'

import { Avatar, Badge, makeStyles } from '@material-ui/core'
import clsx from 'clsx'
import gravatar from 'gravatar'

import { HEADING_FONT } from '@kathena/theme'
import { withComponentHocs } from '@kathena/ui'
import { getDevicePixelRatio } from '@kathena/utils'
import { AccountAvailability, useAccountAvatarQuery } from 'graphql/generated'
import useAccountUtils from 'utils/useAccountUtils'

export type AccountAvatarProps = {
  accountId: string
  size?: number
  disableLink?: boolean
  availabilityBadge?: boolean
}

const AccountAvatar: FC<AccountAvatarProps> = (props) => {
  const classes = useStyles(props)
  const { accountId, size = 40, availabilityBadge = true } = props

  const { getDisplayName } = useAccountUtils()
  const { data } = useAccountAvatarQuery({
    variables: { id: accountId },
  })

  const account = useMemo(() => data?.account, [data?.account])

  const displayName = useMemo(() => (account ? getDisplayName(account) : ''), [
    account,
    getDisplayName,
  ])

  const avatarUrl = useMemo(() => {
    if (!account?.email) return ''

    const email = account?.email ?? 'unknown'

    const url = gravatar.url(email, {
      size: (size * getDevicePixelRatio()).toString(),
      protocol: 'https',
      default: '404',
    })

    return url
  }, [account, size])

  const avatar = (
    <Badge
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      variant="dot"
      invisible={
        !availabilityBadge ||
        account?.availability === AccountAvailability.Offline
      }
      classes={{ badge: clsx(classes.badge, account?.availability) }}
    >
      <Avatar
        alt={displayName.replace(/^@/, '').toUpperCase() ?? ''}
        src={avatarUrl}
        title={displayName}
        // {...AvatarProps}
        classes={{ root: classes.root }}
        style={{
          ...(size && {
            height: size,
            width: size,
            fontSize: `${size * 0.6}px`,
          }),
          // ...AvatarProps.style,
        }}
      />
    </Badge>
  )

  return avatar
}

const useStyles = makeStyles(({ palette }) => ({
  root: {
    backgroundColor: '#2e69ff3b',
    // backgroundColor: palette.secondary.light,
    display: 'inline-flex',
    color: palette.primary.main,
    fontFamily: HEADING_FONT,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: palette.semantic.green,
    color: palette.semantic.green,
    boxShadow: `0 0 0 2px ${palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      border: '1px solid currentColor',
      content: '""',
    },
    '&.Away::after': {
      backgroundColor: '#FFF',
    },
  },
}))

export default withComponentHocs(AccountAvatar)
