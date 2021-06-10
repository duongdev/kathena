import { FC, useMemo } from 'react'

import { CardContent, Grid, makeStyles } from '@material-ui/core'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import {
  InfoBlock,
  PageContainer, SectionCard
} from '@kathena/ui'
import { useAuth } from 'common/auth'
import {
  useAccountProfileQuery
} from 'graphql/generated'





export type DetailClassworkSubmissionProps = {}

const DetailClassworkSubmission: FC<DetailClassworkSubmissionProps> = (
  props,
) => {
  const classes = useStyles(props)

  const params: { id: string } = useParams()
  const idStudent = useMemo(() => params.id, [params.id])
  const { account } = useAuth()

  const { data, loading } = useAccountProfileQuery({
    variables: { username: idStudent },
  })

  return (
    <PageContainer
      withBackButton
      maxWidth="sm"
      title="Thông tin bài tập"
    // subtitle={`@${account?.username}`}
    // actions={[
    //   <AccountStatusChip status={account.status} variant="contained" />,
    // ]}
    >
      <Grid container spacing={DASHBOARD_SPACING}>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 12 }}
          title="Thông tin tài khoản"
        >

          <CardContent>
            <Grid container spacing={2}>
              <InfoBlock gridItem={{ xs: 12 }} label="Mô tả">
                Bùi Huy Hoàng
                {account?.id}
              </InfoBlock>
              <InfoBlock gridItem={{ xs: 12 }} label="Bài tập nộp">
                File
              </InfoBlock>
            </Grid>
          </CardContent>
        </SectionCard>
      </Grid>
    </PageContainer>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default DetailClassworkSubmission
