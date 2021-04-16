import { FC, useMemo } from 'react'

import { Avatar, CardContent, Grid, makeStyles } from '@material-ui/core'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { Button, InfoBlock, PageContainer, SectionCard } from '@kathena/ui'
import { useAcademicSubjectDetailQuery } from 'graphql/generated'

export type AcademicSubjectDetailProps = {}

const AcademicSubjectDetail: FC<AcademicSubjectDetailProps> = (props) => {
  const classes = useStyles(props)
  const params: { id: string } = useParams()
  const id = useMemo(() => params.id, [params])
  const { data } = useAcademicSubjectDetailQuery({
    variables: { Id: id },
  })
  const subjectDetail = useMemo(() => {
    if (data?.academicSubject) {
      return data.academicSubject
    }
    return {
      id: '',
      code: '',
      name: '',
      description: '',
      imageFileId: '',
      publication: '',
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
                  <Avatar variant="rounded" src={subjectDetail.imageFileId} />
                </Grid>
                <Grid container item xs={7}>
                  <InfoBlock gridItem={{ xs: 12 }} label="Mã môn học">
                    {subjectDetail.code}
                  </InfoBlock>
                  <InfoBlock gridItem={{ xs: 12 }} label="Tên môn học">
                    {subjectDetail.name}
                  </InfoBlock>
                  <InfoBlock gridItem={{ xs: 12 }} label="Mô tả">
                    <InfoBlock gridItem={{ xs: 8 }} label="">
                      {subjectDetail.description}
                    </InfoBlock>
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
  imgSubject: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}))

export default AcademicSubjectDetail
