import { FC } from 'react'

import { makeStyles } from '@material-ui/core'
import AccountAvatar from 'components/AccountAvatar/AccountAvatar'
import AccountDisplayName from 'components/AccountDisplayName'

import { withComponentHocs } from '@kathena/ui'

export type AccountInfoRowProps = {
  accountId: string
}

const AccountInfoRow: FC<AccountInfoRowProps> = (props) => {
  const { accountId } = props
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <AccountAvatar accountId={accountId} />
      <AccountDisplayName
        className={classes.displayName}
        accountId={accountId}
      />
    </div>
  )
}

const useStyles = makeStyles({
  root: {
    margin: '0 10px 10px 10px',
    display: 'flex',
    alignItems: 'center',
  },
  displayName: {
    marginLeft: '10px',
  },
})

export default withComponentHocs(AccountInfoRow)
