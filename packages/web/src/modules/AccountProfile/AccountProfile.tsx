import { FC, useCallback, useMemo } from 'react'

import { CardContent, Grid } from '@material-ui/core'
import AccountAvatar from 'components/AccountAvatar/AccountAvatar'
import AccountStatusChip from 'components/AccountStatusChip'
import { useSnackbar } from 'notistack'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import {
  InfoBlock,
  PageContainer,
  PageContainerSkeleton,
  SectionCard,
} from '@kathena/ui'
import {
  useAccountProfileQuery,
  useUpdateAccountStatusMutation,
  AccountProfileDocument,
  AccountStatus,
} from 'graphql/generated'
import { getDisplayName } from 'utils/useAccountUtils'

export type AccountProfileProps = {}

const AccountProfile: FC<AccountProfileProps> = () => {
  const { enqueueSnackbar } = useSnackbar()
  const params: { username: string } = useParams()
  const username = useMemo(() => params.username, [params])
  const { data, loading } = useAccountProfileQuery({
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
      withBackButton
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
        >
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
