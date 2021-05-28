import { FC, useMemo } from 'react'

import { CardContent, Grid, makeStyles } from '@material-ui/core'
import format from 'date-fns/format'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { ANY } from '@kathena/types'
import {
  InfoBlock,
  PageContainer,
  SectionCard,
  SectionCardSkeleton,
  Typography,
} from '@kathena/ui'
import { useAuth } from 'common/auth'
import { useDetailClassworkMaterialQuery } from 'graphql/generated'

export type DetailClassworkMaterialsProps = {}

const DetailClassworkMaterials: FC<DetailClassworkMaterialsProps> = (props) => {
  const classes = useStyles(props)
  const params: { id: string } = useParams()
  const id = useMemo(() => params.id, [params.id])
  const { account } = useAuth()

  const { data, loading } = useDetailClassworkMaterialQuery({
    variables: { Id: id },
  })
  const classworkMaterial = useMemo(() => data?.classworkMaterial, [data])
  if (loading) {
    return (
      <Grid container spacing={DASHBOARD_SPACING}>
        <Grid item xs={9}>
          <SectionCardSkeleton />
        </Grid>
        <Grid item xs={3}>
          <SectionCardSkeleton />
        </Grid>
      </Grid>
    )
  }
  return (
    <PageContainer
      withBackButton
      maxWidth="md"
      title={`${classworkMaterial?.title}`}
    >
      <Grid container spacing={DASHBOARD_SPACING}>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 12 }}
          title="Thông tin tài liệu"
        >
          <CardContent>
            <Grid container spacing={2} className={classes.root}>
              <InfoBlock gridItem={{ xs: 10 }} label="  Giảng viên thêm:">
                <Typography variant="h5">{`${account?.displayName}`}</Typography>
              </InfoBlock>
              <InfoBlock gridItem={{ xs: 2 }} label="Ngày đăng:">
                {format(new Date(classworkMaterial?.createdAt), 'dd/MM/yyyy')}
              </InfoBlock>
              <InfoBlock gridItem={{ xs: 12 }} label="Tiêu đề:">
                {`${classworkMaterial?.title}`}
              </InfoBlock>
              <InfoBlock gridItem={{ xs: 12 }} label="Mô tả:">
                <div
                  // eslint-disable-next-line
                  dangerouslySetInnerHTML={{
                    __html: classworkMaterial?.description as ANY,
                  }}
                  style={{
                    display: '-webkit-box',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                  }}
                />
              </InfoBlock>
              <InfoBlock gridItem={{ xs: 12 }} label="Tài liệu:">
                {classworkMaterial?.attachments.map((attachment) => (
                  <Grid container>{attachment}</Grid>
                ))}
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
