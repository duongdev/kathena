import { FC, useCallback, useMemo } from 'react'

import { CardContent, Grid, makeStyles } from '@material-ui/core'
import AccountAvatar from 'components/AccountAvatar/AccountAvatar'
import { useSnackbar } from 'notistack'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { ANY } from '@kathena/types'
import { Button, InfoBlock, PageContainer, SectionCard } from '@kathena/ui'
import {
  useAccountProfileQuery,
  useUpdateAccountStatusMutation,
  AccountProfileDocument,
  AccountStatus,
} from 'graphql/generated'

export type AccountProfileProps = {}

const AccountProfile: FC<AccountProfileProps> = (props) => {
  const classes = useStyles(props)
  const { enqueueSnackbar } = useSnackbar()
  const params: { username: string } = useParams()
  const username = useMemo(() => params.username, [params])
  const { data } = useAccountProfileQuery({
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
  const account = useMemo(() => {
    if (data?.accountByUserName) {
      return data.accountByUserName
    }
    return {
      id: '',
      displayName: '',
      username: '',
      email: '',
      roles: [],
      status: '',
      availability: '',
    }
  }, [data])

  const handleUpdateAccountStatus = useCallback(
    async (input: string) => {
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
    [updateAccountStatus, account.id, enqueueSnackbar],
  )
  return (
    <div className={classes.root}>
      <PageContainer
        withBackButton
        maxWidth="md"
        title="Thông tin tài khoản"
        actions={[
          <Button
            variant="contained"
            onClick={() =>
              handleUpdateAccountStatus(
                account.status === AccountStatus.Active
                  ? AccountStatus.Deactivated
                  : AccountStatus.Active,
              )
            }
          >
            {account.status === AccountStatus.Active
              ? "Deactivate"
              : "Active"}
          </Button>,
        ]}
      >
        <Grid container spacing={DASHBOARD_SPACING}>
          <SectionCard
            maxContentHeight={false}
            gridItem={{ xs: 12 }}
            title="Thông tin tài khoản"
          >
            <CardContent>
              <Grid container>
                <Grid item xs={5} className={classes.avatarWrapper}>
                  <AccountAvatar size={150} account={account as ANY} />
                </Grid>
                <Grid container item xs={7}>
                  <InfoBlock gridItem={{ xs: 12 }} label="Tên người dùng">
                    {account.displayName}
                  </InfoBlock>
                  <InfoBlock gridItem={{ xs: 12 }} label="Tên đăng nhập">
                    {account.username}
                  </InfoBlock>
                  <InfoBlock gridItem={{ xs: 12 }} label="Email">
                    {account.email}
                  </InfoBlock>
                  <InfoBlock gridItem={{ xs: 12 }} label="Phân quyền">
                    {account.roles.join(', ')}
                  </InfoBlock>
                  <InfoBlock gridItem={{ xs: 12 }} label="Trạng thái">
                    {account.status}
                  </InfoBlock>
                </Grid>
              </Grid>
            </CardContent>
          </SectionCard>
        </Grid>
      </PageContainer>
    </div>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
  avatarWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}))

export default AccountProfile
