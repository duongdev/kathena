/* eslint-disable @typescript-eslint/no-unused-vars */
import { FC, useCallback, useMemo } from 'react'

import { makeStyles, CardContent, Grid } from '@material-ui/core'
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
import { getDisplayName } from 'utils/useAccountUtils'

export type DetailClassworkMaterialsProps = {}

const DetailClassworkMaterials: FC<DetailClassworkMaterialsProps> = (props) => {
  const classes = useStyles(props)
  const { enqueueSnackbar } = useSnackbar()
  const params: { username: string } = useParams()
  const username = useMemo(() => params.username, [params])

  const { data, loading, refetch } = useAccountProfileQuery({
    variables: { username },
  })
  const account = useMemo(() => data?.accountByUserName, [data])
  return (
    <PageContainer
      withBackButton
      maxWidth="xl"
      title="Bùi Huy Hoàng"
      subtitle={`@${account?.email}`}
    >
      <Grid container spacing={DASHBOARD_SPACING}>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 12 }}
          title="Thông tin tài liệu"
        >
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                Bùi huy hoàng
              </Grid>
              <InfoBlock gridItem={{ xs: 6 }} label="Tên người dùng">
                Bùi huy hoàng
              </InfoBlock>
              <InfoBlock gridItem={{ xs: 6 }} label="Tên đăng nhập">
                Bùi huy hoàng
              </InfoBlock>
              <InfoBlock gridItem={{ xs: 6 }} label="Email">
                Bùi huy hoàng
              </InfoBlock>
              <InfoBlock gridItem={{ xs: 6 }} label="Phân quyền">
                Bùi huy hoàng
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

export default DetailClassworkMaterials
