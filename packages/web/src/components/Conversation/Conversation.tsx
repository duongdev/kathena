import { FC, useMemo } from 'react'

import { makeStyles } from '@material-ui/core'
import AccountAvatar from 'components/AccountAvatar/AccountAvatar'

import { withComponentHocs } from '@kathena/ui'
import { useAuth } from 'common/auth'

export type ConversationProps = {
  conversation: {
    id: string
    createdByAccountId: string
    createdAt: string
    content: string
  }
}

const Conversation: FC<ConversationProps> = (props) => {
  const { conversation } = props
  const { $account: accountAuth } = useAuth()

  const owner = useMemo(
    () => accountAuth.id === conversation.createdByAccountId,
    [accountAuth, conversation],
  )
  const classes = useStyles()
  return (
    <div
      style={{ display: 'flex', alignItems: 'baseline' }}
      className={`${owner && classes.reverse}`}
    >
      {!owner && (
        <AccountAvatar size={25} accountId={conversation.createdByAccountId} />
      )}
      <div className={`${classes.root} ${owner && classes.owner}`}>
        <div
          className={`${classes.commentContent} ${
            owner && classes.commentContentOwner
          }`}
        >
          {conversation.content}
        </div>
      </div>
    </div>
  )
}

const useStyles = makeStyles({
  root: {
    marginLeft: '10px',
    background: '#e4e6eb',
    margin: '0 10px 10px 0',
    flexDirection: 'column',
    display: 'flex',
    alignItems: 'flex-start',
    padding: '10px',
    borderRadius: '17px',
  },
  commentContent: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '200px',
  },
  commentContentOwner: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '200px',
    color: '#ffff',
  },

  reverse: {
    flexDirection: 'row-reverse',
  },
  owner: {
    background: '#1877F2',
  },
})

export default withComponentHocs(Conversation)
