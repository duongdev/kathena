import { FC, useMemo } from 'react'

import { gql, useQuery } from '@apollo/client'
import { makeStyles } from '@material-ui/core'
import ConversationAvatar from 'components/ConversationAvatar/ConversationAvatar'
// import { NotePencil } from 'phosphor-react'

import { RoomChat, roomChatPopupVar } from 'common/cache'
import ConversationPopup from 'modules/ConversationPopup'

export type ConversationPopupContainerProps = {}

const LIST_ROOM_CHAT = gql`
  query ListRoomChat {
    listRoomChat @client
  }
`

const ROOM_CHAT_POPUP = gql`
  query RoomChatPopup {
    roomChatPopup @client
  }
`

const ConversationPopupContainer: FC<ConversationPopupContainerProps> = (
  props,
) => {
  const classes = useStyles(props)
  const { data: dataListRoomChat } = useQuery(LIST_ROOM_CHAT)
  const { data: dataRoomChatPopup } = useQuery(ROOM_CHAT_POPUP)
  const listRoomChat: RoomChat[] = useMemo(
    () => dataListRoomChat.listRoomChat ?? [],
    [dataListRoomChat],
  )
  const roomChat: RoomChat = useMemo(
    () => dataRoomChatPopup.roomChatPopup ?? null,
    [dataRoomChatPopup],
  )

  const openPopup = (room: RoomChat) => {
    roomChatPopupVar({
      ...room,
    })
  }

  return (
    <div className={classes.root}>
      {listRoomChat.map(
        (room) =>
          room.roomId !== roomChat?.roomId && (
            <ConversationAvatar
              onClick={() => openPopup(room)}
              size={50}
              roomId={room.roomId}
              type={room.type}
            />
          ),
      )}
      {/* Sẽ bổ sung single conversation sai khi xong các tính năng chính */}
      {/* <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: '#d9d9d9',
          marginTop: '5px',
        }}
      >
        <NotePencil size={30} />
      </div> */}
      {roomChat && <ConversationPopup room={roomChat} />}
    </div>
  )
}

const useStyles = makeStyles(() => ({
  root: {
    position: 'fixed',
    right: 20,
    bottom: 40,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
  },
}))

export default ConversationPopupContainer
