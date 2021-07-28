import { FC, useCallback, useMemo } from 'react'

import { CardContent, Grid } from '@material-ui/core'
import AccountAvatar from 'components/AccountAvatar/AccountAvatar'
import AccountStatusChip from 'components/AccountStatusChip'
import { useSnackbar } from 'notistack'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { ANY } from '@kathena/types'
import {
  Button,
  InfoBlock,
  PageContainer,
  PageContainerSkeleton,
  SectionCard,
  useDialogState,
} from '@kathena/ui'
import { RequiredManageRoles } from 'common/auth'
import {
  useAccountProfileQuery,
  useUpdateAccountStatusMutation,
  AccountProfileDocument,
  AccountStatus,
} from 'graphql/generated'
import { USER_LIST } from 'utils/path-builder'
import { getDisplayName } from 'utils/useAccountUtils'

import { UpdateAccountDialog } from './UpdateAccountDialog'

export type AccountProfileProps = {}

const AccountProfile: FC<AccountProfileProps> = () => {
  const { enqueueSnackbar } = useSnackbar()
  const params: { username: string } = useParams()
  const username = useMemo(() => params.username, [params])
  const [
    updateAccountDialogOpen,
    openUpdateAccountDialog,
    closeUpdateAccountDialog,
  ] = useDialogState()
  const { data, loading, refetch } = useAccountProfileQuery({
    variables: { username },
  })
  const [updateAccountStatus] = useUpdateAccountStatusMutation({
    refetchQueries: [
      {
        query: AccountProfileDocument,
        variables: { username },
      },
    ],
  })
  const account = useMemo(() => data?.accountByUserName, [data])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleUpdateAccountStatus = useCallback(
    async (input: string) => {
      if (!account) return
      try {
        if (account.id === '') return
        const dataUpdated = (
          await updateAccountStatus({
            variables: {
              id: account.id,
              status: input,
            },
          })
        ).data

        const accountUpdated = dataUpdated?.updateAccountStatus

        if (!accountUpdated) {
          return
        }
        enqueueSnackbar(
          `${
            accountUpdated.status === AccountStatus.Active
              ? 'Active'
              : 'Deactivated'
          } tài khoản thành công`,
          { variant: 'success' },
        )
        // eslint-disable-next-line no-console
        console.log(accountUpdated)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
      }
    },
    [account, updateAccountStatus, enqueueSnackbar],
  )

  if (loading) {
    return <PageContainerSkeleton maxWidth="md" />
  }

  if (!account) {
    // TODO: Update not found page
    return <div>Account not found</div>
  }

  return (
    <PageContainer
      backButtonLabel="Danh sách người dùng"
      withBackButton={USER_LIST}
      maxWidth="sm"
      title={getDisplayName(account)}
      subtitle={`@${account.username}`}
      actions={[
        <AccountStatusChip status={account.status} variant="contained" />,
      ]}
    >
      <Grid container spacing={DASHBOARD_SPACING}>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 12 }}
          title="Thông tin tài khoản"
          action={
            <RequiredManageRoles roles={account.roles}>
              <Button
                style={
                  account.status === AccountStatus.Active
                    ? { color: 'red' }
                    : { color: 'green' }
                }
                onClick={() =>
                  handleUpdateAccountStatus(
                    account.status === AccountStatus.Active
                      ? AccountStatus.Deactivated
                      : AccountStatus.Active,
                  )
                }
              >
                {account.status === AccountStatus.Active
                  ? 'Hủy kích hoạt'
                  : 'Kích hoạt'}
              </Button>
              <Button onClick={openUpdateAccountDialog}>Sửa người dùng</Button>
            </RequiredManageRoles>
          }
        >
          <UpdateAccountDialog
            account={account as ANY}
            open={updateAccountDialogOpen}
            onClose={closeUpdateAccountDialog}
            onSuccess={refetch}
          />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <AccountAvatar size={80} account={account} />
              </Grid>
              <InfoBlock gridItem={{ xs: 6 }} label="Tên người dùng">
                {account.displayName}
              </InfoBlock>
              <InfoBlock gridItem={{ xs: 6 }} label="Tên đăng nhập">
                {account.username}
              </InfoBlock>
              <InfoBlock gridItem={{ xs: 6 }} label="Email">
                {account.email}
              </InfoBlock>
              <InfoBlock gridItem={{ xs: 6 }} label="Phân quyền">
                {account.roles.join(', ')}
              </InfoBlock>
            </Grid>
          </CardContent>
        </SectionCard>
      </Grid>
    </PageContainer>
  )
}

export default AccountProfile
