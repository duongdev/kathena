import { FC } from 'react'

import { makeStyles } from '@material-ui/core'
import AccountAvatar from 'components/AccountAvatar/AccountAvatar'
import AccountDisplayName from 'components/AccountDisplayName'
import format from 'date-fns/format'

import { withComponentHocs } from '@kathena/ui'

export type CommentProps = {
  comment: {
    id: string
    createdByAccountId: string
    createdAt: string
    content: string
  }
}

const Comment: FC<CommentProps> = (props) => {
  const { comment } = props
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <div className={classes.commentInfo}>
        <AccountAvatar accountId={comment.createdByAccountId} />
        <div className={classes.commentInfoText}>
          <AccountDisplayName accountId={comment.createdByAccountId} />
          <span className={classes.time}>
            {format(new Date(comment.createdAt), 'MM/dd/yyyy hh:mm:ss')}
          </span>
        </div>
      </div>
      <div className={classes.commentContent}>{comment.content}</div>
    </div>
  )
}

const useStyles = makeStyles({
  root: {
    background: '#ececec',
    margin: '0 10px 10px 0',
    flexDirection: 'column',
    display: 'flex',
    alignItems: 'flex-start',
    padding: '10px',
    borderRadius: '20px',
  },
  time: {
    fontSize: '12px',
    color: '#747474',
  },
  commentInfo: {
    display: 'flex',
  },
  commentInfoText: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: '10px',
  },
  commentContent: {
    flex: 1,
    margin: '10px',
  },
})

export default withComponentHocs(Comment)
