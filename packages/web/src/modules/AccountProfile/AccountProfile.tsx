import { FC, useCallback, useMemo } from 'react'

import { CardContent, Grid, makeStyles, Skeleton } from '@material-ui/core'
import { useSnackbar } from 'notistack'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { ANY } from '@kathena/types'
import { Button, PageContainer, SectionCard, Typography } from '@kathena/ui'
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
              ? AccountStatus.Deactivated
              : AccountStatus.Active}
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
              <ContentItem
                title="Tên người dùng"
                content={account.displayName as ANY}
                loading={loading}
              />
              <ContentItem
                title="Tên đăng nhập"
                content={account.username}
                loading={loading}
              />
              <ContentItem
                title="Email"
                content={account.email}
                loading={loading}
              />
              <ContentItem
                title="Phân quyền"
                content={account.roles.join(', ')}
                loading={loading}
              />
              <ContentItem
                title="Trạng thái"
                content={account.status}
                loading={loading}
              />
            </CardContent>
          </SectionCard>
        </Grid>
      </PageContainer>
    </div>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
  rootContent: {
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
}))

type ContentItemProps = {
  title: string
  content: string | undefined
  loading?: boolean
}
const ContentItem: FC<ContentItemProps> = (props) => {
  const classes = useStyles(props)
  const { title, content, loading } = props
  return (
    <div className={classes.rootContent}>
      <Typography variant="h6">{title}: </Typography>
      {!loading ? (
        <Typography variant="body1">{content}</Typography>
      ) : (
        <Skeleton />
      )}
    </div>
  )
}

export default AccountProfile
