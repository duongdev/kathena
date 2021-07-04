import { FC, useMemo } from 'react'

import { gql, useQuery } from '@apollo/client'
import { makeStyles } from '@material-ui/core'

export type ConversationProps = {}

const LIST_ROOM_CHAT = gql`
  query ListRoomChat {
    listRoomChat @client
  }
`

const Conversation: FC<ConversationProps> = (props) => {
  const classes = useStyles(props)
  const { data } = useQuery(LIST_ROOM_CHAT)
  const listRoomChat: string[] = useMemo(() => data.listRoomChat ?? [], [data])
  return (
    <div className={classes.root}>
      {listRoomChat.map((_item) => (
        <div
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'red',
          }}
        />
      ))}
    </div>
  )
}

const useStyles = makeStyles(() => ({
  root: {
    background: '#c9c9c9',
    position: 'fixed',
    right: 20,
    bottom: 40,
  },
}))

export default Conversation
