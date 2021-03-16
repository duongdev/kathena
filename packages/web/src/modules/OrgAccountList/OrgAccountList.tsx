import { FC } from 'react'

import { Chip, makeStyles, Paper } from '@material-ui/core'
import AccountAvatar from 'components/AccountAvatar/AccountAvatar'
import AccountDisplayName from 'components/AccountDisplayName'
import { UserPlus } from 'phosphor-react'

import { Button, DataTable, PageContainer, Typography } from '@kathena/ui'
import { useAuth, WithAuth } from 'common/auth'
import { Permission, useOrgAccountListQuery } from 'graphql/generated'

export type OrgAccountListProps = {}

const OrgAccountList: FC<OrgAccountListProps> = (props) => {
  const classes = useStyles(props)
  const { $org: org } = useAuth()
  const { data, loading } = useOrgAccountListQuery({
    variables: { orgId: org.id, limit: 1000, skip: 0 },
  })

  const accounts = data?.orgAccounts.accounts ?? []

  return (
    <PageContainer
      className={classes.root}
      title="Danh sách người dùng"
      actions={[
        <Button variant="contained" color="primary" startIcon={<UserPlus />}>
          Thêm người dùng
        </Button>,
      ]}
    >
      <Paper>
        <DataTable
          data={accounts}
          rowKey="id"
          loading={loading}
          columns={[
            {
              render: (account) => <AccountAvatar accountId={account.id} />,
              width: '1%',
            },
            {
              label: 'Tên người dùng',
              render: (account) => (
                <>
                  <AccountDisplayName variant="body1" accountId={account.id} />
                  <Typography variant="body2" color="textSecondary">
                    @{account.username}
                  </Typography>
                </>
              ),
            },
            {
              label: 'Địa chỉ email',
              field: 'email',
            },
            {
              label: 'Phân quyền',
              render: (account) =>
                account.roles.map((role) => <Chip key={role} label={role} />),
            },
          ]}
        />
      </Paper>
    </PageContainer>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

const WithPermissionOrgAccountList = () => (
  <WithAuth permission={Permission.Hr_ListOrgAccounts}>
    <OrgAccountList />
  </WithAuth>
)

export default WithPermissionOrgAccountList
