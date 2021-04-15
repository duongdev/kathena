import { FC, useMemo } from 'react'

import { Avatar, CardContent, Grid, makeStyles } from '@material-ui/core'
import AccountAvatar from 'components/AccountAvatar/AccountAvatar'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { ANY } from '@kathena/types'
import { Button, InfoBlock, PageContainer, SectionCard } from '@kathena/ui'
import { useAccountProfileQuery } from 'graphql/generated'

export type AcademicSubjectProfileProps = {}

const AcademicSubjectProfile: FC<AcademicSubjectProfileProps> = (props) => {
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
      id: '',
      code: '',
      name: '',
      description: '',
      imageFileId: '',
      publication: '',
      // id: '',
      // displayName: '',
      // username: '',
      // email: '',
      // roles: [],
      // status: '',
      // availability: '',
    }
  }, [data])
  return (
    <div className={classes.root}>
      <PageContainer
        withBackButton
        maxWidth="md"
        title="Thông tin môn học"
        actions={[<Button variant="contained">Activate</Button>]}
      >
        <Grid container spacing={DASHBOARD_SPACING}>
          <SectionCard
            maxContentHeight={false}
            gridItem={{ xs: 12 }}
            title="Thông tin môn học"
          >
            <CardContent>
              <Grid container>
                <Grid item xs={5} className={classes.imgSubject}>
                  {/* <AccountAvatar size={150} account={account as ANY} /> */}
                  <Avatar
                    variant="rounded"
                    src="https://picsum.photos/200/300"
                  />
                </Grid>
                <Grid container item xs={7}>
                  <InfoBlock gridItem={{ xs: 12 }} label="Mã môn học">
                    {account.id}
                  </InfoBlock>
                  {/* <InfoBlock gridItem={{ xs: 12 }} label="Tên môn học">
                    {account.name}
                  </InfoBlock>
                  <InfoBlock gridItem={{ xs: 12 }} label="Mô tả">
                    {account.description}
                  </InfoBlock>
                  <InfoBlock gridItem={{ xs: 12 }} label="Phân quyền">
                    {account.roles.join(', ')}
                  </InfoBlock>
                  <InfoBlock gridItem={{ xs: 12 }} label="Trạng thái">
                    {account.publication}
                  </InfoBlock> */}
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
  imgSubject: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}))

export default AcademicSubjectProfile
