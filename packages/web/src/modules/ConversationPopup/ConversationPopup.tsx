import { FC, useState, useEffect, useCallback } from 'react'

import { makeStyles } from '@material-ui/core'
import Conversation from 'components/Conversation/Conversation'
import ConversationAvatar from 'components/ConversationAvatar/ConversationAvatar'
import useConversationName from 'hooks/useConversationName'
import { Minus, PaperPlaneRight, X } from 'phosphor-react'

import { ANY } from '@kathena/types'
import { Button, InputField } from '@kathena/ui'
import { useAuth } from 'common/auth'
import { listRoomChatVar, RoomChat, roomChatPopupVar } from 'common/cache'
import {
  Conversation as ConversationModel,
  useConversationCreatedSubscription,
  useConversationsQuery,
  useCreateConversationMutation,
} from 'graphql/generated'

export type ConversationPopupProps = {
  room: RoomChat
}

const ConversationPopup: FC<ConversationPopupProps> = (props) => {
  const { room } = props
  const classes = useStyles(props)
  const { $account: accountAuth } = useAuth()

  const [lastId, setLastId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<ConversationModel[]>([])
  const [totalConversation, setTotalConversation] = useState(0)

  const { data: dataConversationCreated } = useConversationCreatedSubscription({
    variables: { roomId: room.roomId },
  })

  const { data: dataConversations, refetch } = useConversationsQuery({
    variables: {
      roomId: room.roomId,
      conversationPageOptionInput: {
        limit: 10,
      },
      lastId,
    },
  })

  useEffect(() => {
    const newListConversation =
      dataConversations?.conversations.conversations ?? []
    const listConversation = [...conversations, ...newListConversation]
    setConversations(listConversation as ANY)
    if (dataConversations?.conversations.count) {
      setTotalConversation(dataConversations?.conversations.count)
    }

    // eslint-disable-next-line
  }, [dataConversations])

  useEffect(() => {
    const newConversation = dataConversationCreated?.conversationCreated
    if (newConversation) {
      const listConversation = [newConversation, ...conversations]
      setConversations(listConversation as ANY)
      setTotalConversation(totalConversation + 1)
    }
    // eslint-disable-next-line
  }, [dataConversationCreated])

  const loadMoreConversations = (lastConversationId: string) => {
    setLastId(lastConversationId)
    refetch()
  }

  const [input, setInput] = useState('')

  const closePopup = () => {
    roomChatPopupVar(null)
  }

  const closeRoomChat = () => {
    roomChatPopupVar(null)
    const newArr = [...listRoomChatVar()]
    newArr.splice(
      newArr.findIndex((i) => i.roomId === room.roomId),
      1,
    )
    listRoomChatVar([...newArr])
  }
  const conversationName = useConversationName(room.roomId, room.type)

  const [createConversation] = useCreateConversationMutation()

  const handleSend = useCallback(async () => {
    try {
      if (input.trim() === '') return
      const { data: dataCreated } = await createConversation({
        variables: {
          input: {
            content: input,
            createdByAccountId: accountAuth.id,
            roomId: room.roomId,
          },
        },
      })

      const comment = dataCreated?.createConversation

      if (!comment) {
        return
      }
      setInput('')
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }, [accountAuth, input, room, createConversation])

  return (
    <div className={`${classes.root}`}>
      <div className={classes.top}>
        <div className={classes.info}>
          <div style={{ width: '7px' }} />
          <ConversationAvatar size={32} roomId={room.roomId} type={room.type} />
          <div
            style={{
              marginLeft: '5px',
              overflow: 'hidden',
              lineHeight: '40px',
              height: '40px',
            }}
            title={conversationName}
          >
            {conversationName}
          </div>
        </div>
        <div className={classes.actions}>
          <Minus
            onClick={closePopup}
            style={{ cursor: 'pointer', color: '#0065FF' }}
            size={26}
          />
          <X
            onClick={closeRoomChat}
            style={{ marginLeft: '8px', cursor: 'pointer', color: '#0065FF' }}
            size={26}
          />
        </div>
      </div>
      <div className={classes.middle}>
        {conversations.length ? (
          <>
            {' '}
            {conversations.map((conversation: ConversationModel) => (
              <Conversation
                key={conversation.id}
                conversation={{
                  id: conversation.id,
                  createdByAccountId: conversation.createdByAccountId,
                  createdAt: conversation.createdAt,
                  content: conversation.content,
                }}
              />
            ))}
            <Button
              disabled={conversations.length === totalConversation}
              onClick={() =>
                loadMoreConversations(
                  conversations[conversations.length - 1].id,
                )
              }
            >
              Xem thêm
            </Button>
          </>
        ) : (
          ''
        )}
      </div>
      <div className={classes.bottom}>
        <InputField
          value={input}
          placeholder="Bình luận..."
          onChange={(e) => setInput(e.target.value)}
          style={{
            height: '35px',
            marginLeft: '7px',
            width: '300px',
            borderRadius: '15px',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSend()
            }
          }}
        />
        <PaperPlaneRight
          onClick={handleSend}
          size={26}
          style={{ color: '#2e69ff', marginLeft: '7px', cursor: 'pointer' }}
        />
      </div>
    </div>
  )
}

const useStyles = makeStyles(({ palette }) => ({
  root: {
    width: '350px',
    height: '450px',
    // background: palette.background.dark,
    background: '#fff',
    position: 'absolute',
    left: -360,
    bottom: -40,
    display: 'flex',
    flexDirection: 'column',
    borderTopLeftRadius: '15px',
    borderTopRightRadius: '15px',
    boxShadow: '0px 0px 20px rgb(0 0 0 / 10%)',
    zIndex: 1000,
  },
  top: {
    height: '50px',
    background: '#fff',
    borderTopLeftRadius: '15px',
    borderTopRightRadius: '15px',
    display: 'flex',
    boxShadow: `0px 5px 5px ${palette.divider}`,
  },
  middle: {
    border: '2px solid #fff',
    flex: 1,
    display: 'flex',
    flexWrap: 'nowrap',
    padding: '5px',
    overflowY: 'scroll',
    flexDirection: 'column-reverse',
  },
  bottom: {
    height: '45px',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
  },
  info: {
    display: 'flex',
    alignItems: 'center',
    width: '280px',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
}))

export default ConversationPopup
