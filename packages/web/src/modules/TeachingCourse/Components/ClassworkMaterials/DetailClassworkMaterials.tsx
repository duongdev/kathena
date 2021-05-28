import { FC, useMemo } from 'react'

import { CardContent, Grid, makeStyles } from '@material-ui/core'
import format from 'date-fns/format'
import { useSnackbar } from 'notistack'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { InfoBlock, PageContainer, SectionCard, Typography } from '@kathena/ui'
import { useDetailClassworkMaterialQuery } from 'graphql/generated'

export type DetailClassworkMaterialsProps = {}

const DetailClassworkMaterials: FC<DetailClassworkMaterialsProps> = (props) => {
  const classes = useStyles(props)
  const { enqueueSnackbar } = useSnackbar()
  const params: { id: string } = useParams()
  const id = useMemo(() => params.id, [params.id])

  const { data } = useDetailClassworkMaterialQuery({
    variables: { Id: id },
  })
  const classworkMaterial = useMemo(() => data?.classworkMaterial, [data])
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
            <Grid container spacing={2}>
              <Grid item xs={12}>
                Giảng viên thêm: {`${classworkMaterial?.createdByAccountId}`}
              </Grid>
              <InfoBlock gridItem={{ xs: 9 }} label="Tiêu đề:">
                {`${classworkMaterial?.title}`}
              </InfoBlock>
              <InfoBlock gridItem={{ xs: 3 }} label="Ngày đăng:">
                <Typography>
                  {format(new Date(classworkMaterial?.createdAt), 'dd/MM/yyyy')}
                </Typography>
              </InfoBlock>
              <InfoBlock gridItem={{ xs: 12 }} label="Mô tả:">
                {`${classworkMaterial?.description}`}
              </InfoBlock>
              <InfoBlock gridItem={{ xs: 12 }} label="Tài liệu">
                {`${classworkMaterial?.attachments}`}
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
