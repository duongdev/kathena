import { FC, useMemo } from 'react'

import { CardContent, Grid, makeStyles } from '@material-ui/core'
import FileComponent from 'components/FileComponent'
import PublicationChip from 'components/PublicationChip'
import format from 'date-fns/format'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { ANY } from '@kathena/types'
import {
  Button,
  InfoBlock,
  PageContainer,
  SectionCard,
  SectionCardSkeleton,
  Typography,
} from '@kathena/ui'
import { useAuth } from 'common/auth'
import { useDetailClassworkMaterialQuery } from 'graphql/generated'
import AccountInfoRow from 'modules/StudyingCourse/Components/AccountInfoRow'
import { buildPath } from 'utils/path-builder'

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
      subtitle={[
        <>
          <Grid container spacing={2} className={classes.root}>
            <InfoBlock gridItem={{ xs: 2 }} label="Ngày đăng:">
              {`${format(
                new Date(classworkMaterial?.createdAt),
                'dd/MM/yyyy',
              )}`}
            </InfoBlock>
            <InfoBlock gridItem={{ xs: 10 }} label="Người đăng:">
              <AccountInfoRow
                gridItem={{ xs: 4 }}
                key={`${account?.id}`}
                accountId={`${account?.id}`}
              />
            </InfoBlock>
          </Grid>
        </>,
      ]}
      actions={[
        <PublicationChip
          publication={classworkMaterial?.publicationState as ANY}
          variant="outlined"
          size="medium"
        />,
      ]}
    >
      <Grid container spacing={DASHBOARD_SPACING}>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 12 }}
          title="Thông tin tài liệu"
          action={[
            <Button
              variant="contained"
              link={buildPath('123', { id: classworkMaterial?.id as ANY })}
            >
              Sửa tài liệu
            </Button>,
          ]}
        >
          <CardContent>
            <Grid container spacing={2} className={classes.root}>
              <InfoBlock gridItem={{ xs: 10 }} label="Tiêu đề:">
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
              <InfoBlock gridItem={{ xs: 12 }} label="Tập tin đính kèm: ">
                {classworkMaterial?.attachments.length ? (
                  classworkMaterial?.attachments.map((attachment) => (
                    <Grid container>
                      <FileComponent key={attachment} fileId={attachment} />
                    </Grid>
                  ))
                ) : (
                  <Grid container>
                    {' '}
                    <Typography>Không có tập tin</Typography>
                  </Grid>
                )}
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
