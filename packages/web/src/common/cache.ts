import { InMemoryCache, makeVar } from '@apollo/client'

export const listRoomChatVar = makeVar<string[]>([])

const cache: InMemoryCache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        listRoomChat: {
          read() {
            return listRoomChatVar()
          },
        },
      },
    },
  },
})

export default cache
