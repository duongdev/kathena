import { FC, useMemo } from 'react'

import { CardContent, Grid, makeStyles } from '@material-ui/core'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { ANY } from '@kathena/types'
import { PageContainer, SectionCard, Typography } from '@kathena/ui'
import { useAccountProfileQuery } from 'graphql/generated'

export type AccountProfileProps = {}

const AccountProfile: FC<AccountProfileProps> = (props) => {
  const classes = useStyles(props)
  const params: { username: string } = useParams()
  const username = useMemo(() => params.username, [params])
  const { data } = useAccountProfileQuery({
    variables: { username },
  })
  const account = useMemo(() => {
    if (data?.accountByUserName) {
      return data.accountByUserName
    }
    return {
      displayName: '',
      username: '',
      email: '',
      roles: [],
      status: '',
    }
  }, [data])
  return (
    <div className={classes.root}>
      <PageContainer withBackButton maxWidth="sm" title="Thông tin tài khoản">
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
              />
              <ContentItem title="Tên đăng nhập" content={account.username} />
              <ContentItem title="Email" content={account.email} />
              <ContentItem
                title="Phân quyền"
                content={account.roles.join(', ')}
              />
              <ContentItem title="Trạng thái" content={account.status} />
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
}
const ContentItem: FC<ContentItemProps> = (props) => {
  const classes = useStyles(props)
  const { title, content } = props
  return (
    <div className={classes.rootContent}>
      <Typography variant="h6">{title}: </Typography>
      <Typography variant="body1">{content}</Typography>
    </div>
  )
}

export default AccountProfile
