import { FC } from 'react'

import { Chip, makeStyles, Paper } from '@material-ui/core'
import AccountAvatar from 'components/AccountAvatar/AccountAvatar'
import { UserPlus } from 'phosphor-react'

import { Button, DataTable, PageContainer, Typography } from '@kathena/ui'
import { useAuth } from 'common/auth'
import { useOrgAccountListQuery } from 'graphql/generated'

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
              label: 'Tên',
              render: (account) => (
                <>
                  <Typography variant="body1">{account.displayName}</Typography>
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

export default OrgAccountList
