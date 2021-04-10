import { FC, useMemo } from 'react'

import { Grid } from '@material-ui/core'

import { Dialog } from '@kathena/ui'
import { Account, useAccountDetailQuery } from 'graphql/generated'

export type AccountWithId = {
  accountId: string
}

export type AccountWithAccount = {
  account: Pick<
    Account,
    'id' | 'username' | 'displayName' | 'email' | 'availability'
  >
}

export type AccountDetailDialogProps = {
  open: boolean
  onClose: () => void
} & (AccountWithId | AccountWithAccount)

export const AccountDetailDialog: FC<AccountDetailDialogProps> = (props) => {
  const { open, onClose } = props
  const { accountId } = props as AccountWithId
  const { account: accountProp } = props as AccountWithAccount
  const { data } = useAccountDetailQuery({
    variables: { id: accountId },
    skip: !!accountProp,
  })

  const account = useMemo(() => accountProp || data?.account, [
    data?.account,
    accountProp,
  ])

  return (
    <Dialog open={open} onClose={onClose} width={400}>
      <Grid container spacing={2}>
        {account.displayName}
      </Grid>
    </Dialog>
  )
}
