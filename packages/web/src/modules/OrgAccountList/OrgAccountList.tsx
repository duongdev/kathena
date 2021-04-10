import { FC, useCallback, useMemo, useState } from 'react'

import { Chip, makeStyles, Paper, Skeleton } from '@material-ui/core'
import AccountAvatar, {
  AccountAvatarSkeleton,
} from 'components/AccountAvatar/AccountAvatar'
import AccountDisplayName from 'components/AccountDisplayName'
import { UserPlus } from 'phosphor-react'

import { ANY } from '@kathena/types'
import {
  Button,
  DataTable,
  PageContainer,
  Typography,
  usePagination,
} from '@kathena/ui'
import { useAuth, WithAuth } from 'common/auth'
import { Permission, useOrgAccountListQuery } from 'graphql/generated'
import { AccountDetailDialog } from 'modules/AccountDetail'
import { CreateAccountDialog } from 'modules/CreateUpdateAccount'

export type OrgAccountListProps = {}

const OrgAccountList: FC<OrgAccountListProps> = (props) => {
  const classes = useStyles(props)
  const { $org: org } = useAuth()
  const { page, perPage, setPage, setPerPage } = usePagination()
  const { data, loading, refetch } = useOrgAccountListQuery({
    variables: { orgId: org.id, limit: perPage, skip: page * perPage },
  })
  const [createAccountDialogOpen, setCreateAccountDialogOpen] = useState(false)
  const [accountDetailDialogOpen, setAccountDetailDialogOpen] = useState(false)
  const [valueAccountDetail, setValueAccountDetail] = useState({} as ANY)

  const handleOpenCreateAccountDialog = useCallback(
    () => setCreateAccountDialogOpen(true),
    [],
  )
  const handleCloseCreateAccountDialog = useCallback(
    () => setCreateAccountDialogOpen(false),
    [],
  )

  const handleOpenAccountDetailClick = useCallback((account) => {
    setValueAccountDetail(account)
    setAccountDetailDialogOpen(true)
  }, [])

  const handleCloseAccountDetailDialog = useCallback(
    () => setAccountDetailDialogOpen(false),
    [],
  )

  const accounts = useMemo(() => data?.orgAccounts.accounts ?? [], [
    data?.orgAccounts.accounts,
  ])
  const totalCount = useMemo(() => data?.orgAccounts.count ?? 0, [
    data?.orgAccounts.count,
  ])

  return (
    <PageContainer
      className={classes.root}
      title="Danh sách người dùng"
      actions={[
        <Button
          variant="contained"
          color="primary"
          startIcon={<UserPlus />}
          onClick={handleOpenCreateAccountDialog}
        >
          Thêm người dùng
        </Button>,
      ]}
    >
      <CreateAccountDialog
        open={createAccountDialogOpen}
        onClose={handleCloseCreateAccountDialog}
        onSuccess={refetch}
      />

      <AccountDetailDialog
        open={accountDetailDialogOpen}
        onClose={handleCloseAccountDetailDialog}
        account={valueAccountDetail}
      />

      <Paper>
        <DataTable
          data={accounts}
          rowKey="id"
          loading={loading}
          columns={[
            {
              render: (account) => <AccountAvatar account={account} />,
              width: '1%',
              skeleton: <AccountAvatarSkeleton />,
            },
            {
              label: 'Tên người dùng',
              render: (account) => (
                <>
                  <AccountDisplayName
                    className={classes.pointer}
                    variant="body1"
                    account={account}
                    onClick={() => handleOpenAccountDetailClick(account)}
                  />
                  <Typography variant="body2" color="textSecondary">
                    @{account.username}
                  </Typography>
                </>
              ),
              skeleton: <Skeleton />,
            },
            {
              label: 'Địa chỉ email',
              field: 'email',
              skeleton: <Skeleton />,
            },
            {
              label: 'Phân quyền',
              render: (account) =>
                account.roles.map((role) => <Chip key={role} label={role} />),
              skeleton: <Skeleton />,
            },
          ]}
          pagination={{
            count: totalCount,
            rowsPerPage: perPage,
            page,
            onPageChange: (e, nextPage) => setPage(nextPage),
            onRowsPerPageChange: (event) => setPerPage(+event.target.value),
          }}
        />
      </Paper>
    </PageContainer>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
  pointer: {
    cursor: 'pointer',
  },
}))

const WithPermissionOrgAccountList = () => (
  <WithAuth permission={Permission.Hr_ListOrgAccounts}>
    <OrgAccountList />
  </WithAuth>
)

export default WithPermissionOrgAccountList
