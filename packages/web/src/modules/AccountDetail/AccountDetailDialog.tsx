import { FC, useMemo } from 'react'

import { Grid, makeStyles } from '@material-ui/core'
import AccountAvatar from 'components/AccountAvatar/AccountAvatar'

import { Dialog, InputField } from '@kathena/ui'
import { Account, useAccountDetailQuery } from 'graphql/generated'

export type AccountWithId = {
  accountId: string
}

export type AccountWithAccount = {
  account: Pick<
    Account,
    | 'id'
    | 'username'
    | 'displayName'
    | 'email'
    | 'roles'
    | 'status'
    | 'availability'
  >
}

export type AccountDetailDialogProps = {
  open: boolean
  onClose: () => void
} & (AccountWithId | AccountWithAccount)

export const AccountDetailDialog: FC<AccountDetailDialogProps> = (props) => {
  const classes = useStyles(props)
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
    <Dialog
      open={open}
      onClose={onClose}
      width={500}
      dialogTitle="Chi tiết tài khoản"
    >
      <Grid container spacing={2}>
        <Grid item xs={12} className={classes.avatarWrapper}>
          <AccountAvatar size={150} account={account} />
        </Grid>
        <InputField
          gridItem={{ xs: 12 }}
          label="Tên người dùng"
          value={account.displayName}
          fullWidth
          disabled
        />
        <InputField
          gridItem={{ xs: 12 }}
          label="Tên đăng nhập"
          value={account.username}
          fullWidth
          disabled
        />
        <InputField
          gridItem={{ xs: 12 }}
          label="Email"
          value={account.email}
          fullWidth
          disabled
        />
        <InputField
          gridItem={{ xs: 12 }}
          label="Phân quyền"
          value={account.roles?.join(', ')}
          fullWidth
          disabled
        />
        <InputField
          gridItem={{ xs: 12 }}
          label="Trạng thái"
          value={account.status}
          fullWidth
          disabled
        />
      </Grid>
    </Dialog>
  )
}

const useStyles = makeStyles(() => ({
  avatarWrapper: {
    display: 'flex',
    justifyContent: 'center',
  },
}))
