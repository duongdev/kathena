import { InMemoryCache, makeVar } from '@apollo/client'

import { ConversationType } from 'graphql/generated'

export type RoomChat = {
  roomId: string
  type: ConversationType
}

export const listRoomChatVar = makeVar<RoomChat[]>([])
export const roomChatPopupVar = makeVar<RoomChat | null>(null)

const cache: InMemoryCache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        listRoomChat: {
          read() {
            return listRoomChatVar()
          },
        },
        roomChatPopup: {
          read() {
            return roomChatPopupVar()
          },
        },
      },
    },
  },
})

export default cache
