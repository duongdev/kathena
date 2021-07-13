import { FC, useMemo } from 'react'

import { Avatar, Badge, makeStyles } from '@material-ui/core'
import clsx from 'clsx'
import gravatar from 'gravatar'
import useConversationName from 'hooks/useConversationName'

import { HEADING_FONT } from '@kathena/theme'
import { withComponentHocs } from '@kathena/ui'
import { getDevicePixelRatio } from '@kathena/utils'
import { useAuth } from 'common/auth'
import {
  AccountAvailability,
  ConversationType,
  useAccountAvatarQuery,
} from 'graphql/generated'

import kminLogo from './kmin-logo.png'

export type ConversationAvatarProps = {
  roomId: string
  type: ConversationType
  size?: number
  onClick?: () => void
}

const ConversationAvatar: FC<ConversationAvatarProps> = (props) => {
  const { size = 40, roomId, type, onClick } = props
  const { $account: accountAuth } = useAuth()
  const classes = useStyles(props)

  const arrId = useMemo(
    () => roomId.split(accountAuth.id),
    [accountAuth, roomId],
  )
  const targetId = useMemo(() => {
    if (type === ConversationType.Group) {
      return roomId
    }
    return arrId[0] === '' ? arrId[1] : arrId[0]
  }, [arrId, roomId, type])

  const { data } = useAccountAvatarQuery({
    variables: { id: targetId },
  })

  const account = useMemo(() => data?.account, [data?.account])

  const avatarUrl = useMemo(() => {
    if (type === ConversationType.Group) return kminLogo
    if (!account?.email) return ''

    const email = account?.email ?? 'unknown'

    const url = gravatar.url(email, {
      size: (size * getDevicePixelRatio()).toString(),
      protocol: 'https',
      default: '404',
    })

    return url
  }, [account, size, type])

  const conversationName = useConversationName(roomId, type)

  const avatar = useMemo(() => {
    if (type === ConversationType.Single) {
      return (
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
          invisible={account?.availability === AccountAvailability.Offline}
          classes={{ badge: clsx(classes.badge, account?.availability) }}
        >
          <Avatar
            title={conversationName}
            onClick={onClick}
            src={avatarUrl}
            classes={{ root: classes.root }}
            style={{
              ...(size && {
                height: size,
                width: size,
                fontSize: `${size * 0.6}px`,
              }),
            }}
          />
        </Badge>
      )
    }
    return (
      <Avatar
        title={conversationName}
        onClick={onClick}
        src={avatarUrl}
        classes={{ root: classes.root }}
        style={{
          ...(size && {
            height: size,
            width: size,
            fontSize: `${size * 0.6}px`,
          }),
        }}
      />
    )
  }, [account, avatarUrl, classes, size, type, onClick, conversationName])

  return avatar
}

const useStyles = makeStyles(({ palette }) => ({
  root: {
    cursor: 'pointer',
    backgroundColor: '#2e69ff3b',
    display: 'inline-flex',
    color: palette.primary.main,
    fontFamily: HEADING_FONT,
    fontWeight: 'bold',
    marginTop: '5px',
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

export default withComponentHocs(ConversationAvatar)
