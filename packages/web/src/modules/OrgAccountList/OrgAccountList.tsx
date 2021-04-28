import { FC, useMemo } from 'react'

import { Chip, makeStyles, Paper, Skeleton } from '@material-ui/core'
import AccountAvatar, {
  AccountAvatarSkeleton,
} from 'components/AccountAvatar/AccountAvatar'
import AccountDisplayName from 'components/AccountDisplayName'
import AccountStatusChip from 'components/AccountStatusChip'
import { UserPlus } from 'phosphor-react'

import {
  Button,
  DataTable,
  Link,
  PageContainer,
  Typography,
  useDialogState,
  usePagination,
} from '@kathena/ui'
import { useAuth, WithAuth } from 'common/auth'
import { Permission, useOrgAccountListQuery } from 'graphql/generated'
import { CreateAccountDialog } from 'modules/CreateUpdateAccount'
import { buildPath, USER_PROFILE } from 'utils/path-builder'

export type OrgAccountListProps = {}

const OrgAccountList: FC<OrgAccountListProps> = (props) => {
  const classes = useStyles(props)
  const { $org: org } = useAuth()
  const { page, perPage, setPage, setPerPage } = usePagination()
  const { data, loading, refetch } = useOrgAccountListQuery({
    variables: { orgId: org.id, limit: perPage, skip: page * perPage },
  })
  const [
    createAccountDialogOpen,
    openCreateAccountDialog,
    closeCreateAccountDialog,
  ] = useDialogState()

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
          onClick={openCreateAccountDialog}
        >
          Thêm người dùng
        </Button>,
      ]}
    >
      <CreateAccountDialog
        open={createAccountDialogOpen}
        onClose={closeCreateAccountDialog}
        onSuccess={refetch}
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
                  <Link
                    to={buildPath(USER_PROFILE, { username: account.username })}
                  >
                    <AccountDisplayName
                      className={classes.pointer}
                      variant="body1"
                      account={account}
                    />
                  </Link>
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
            {
              label: 'Trạng thái',
              render: (account) => (
                <AccountStatusChip status={account.status} />
              ),
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
