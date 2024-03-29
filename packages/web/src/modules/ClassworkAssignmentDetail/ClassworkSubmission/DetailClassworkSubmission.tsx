import { FC, useMemo } from 'react'

import { CardContent, Grid, makeStyles } from '@material-ui/core'
import FileComponent from 'components/FileComponent'
import { format } from 'date-fns'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { ANY } from '@kathena/types'
import {
  Button,
  InfoBlock,
  PageContainerSkeleton,
  Typography,
  PageContainer,
  SectionCard,
} from '@kathena/ui'
import { WithAuth } from 'common/auth'
import {
  useFindClassworkSubmissionByIdQuery,
  Permission,
} from 'graphql/generated'

import AccountInfoRow from '../../StudyingCourse/Components/AccountInfoRow'

export type DetailClassworkSubmissionProps = {}

const DetailClassworkSubmission: FC<DetailClassworkSubmissionProps> = (
  props,
) => {
  const classes = useStyles(props)

  const params: { id: string } = useParams()
  const idStudent = useMemo(() => params.id, [params.id])

  const { data, loading } = useFindClassworkSubmissionByIdQuery({
    variables: { classworkSubmissionId: idStudent },
  })
  const idSubmission = useMemo(() => data?.findClassworkSubmissionById, [data])
  if (loading && !data) {
    return <PageContainerSkeleton maxWidth="md" />
  }

  if (!idSubmission) {
    return (
      <PageContainer maxWidth="md">
        <Typography align="center">
          Bài tập không tồn tại hoặc đã bị xoá.
        </Typography>
      </PageContainer>
    )
  }
  return (
    <PageContainer
      withBackButton
      maxWidth="md"
      title="Thông tin bài tập"
      actions={[
        <Button backgroundColorButton="primary" variant="contained">
          Chấm điểm
        </Button>,
      ]}
    >
      <Grid container spacing={DASHBOARD_SPACING}>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 12 }}
          title="Nội dung bài tập nộp"
        >
          <CardContent className={classes.root}>
            <Grid container spacing={1}>
              <InfoBlock gridItem={{ xs: 5 }} label="Thông tin học viên: ">
                <AccountInfoRow
                  key={idSubmission.createdByAccountId}
                  accountId={idSubmission.createdByAccountId}
                />
              </InfoBlock>
              <InfoBlock
                gridItem={{ xs: 7 }}
                label="Thời gian học viên nộp bài tập: "
              >
                {format(new Date(idSubmission.createdAt), 'MM/dd/yyyy')}
              </InfoBlock>
              <InfoBlock gridItem={{ xs: 12 }} label="Nội dung: ">
                <div
                  // eslint-disable-next-line
                  dangerouslySetInnerHTML={{
                    __html: idSubmission.description as ANY,
                  }}
                />
              </InfoBlock>

              <InfoBlock gridItem={{ xs: 12 }} label="Bài tập của học viên:">
                {idSubmission.submissionFileIds.length ? (
                  idSubmission.submissionFileIds.map((attachment) => (
                    <FileComponent key={attachment} fileId={attachment} />
                  ))
                ) : (
                  <Typography>Không có file đính kèm.</Typography>
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
const WithPermissionDetailClassworkSubmission = () => (
  <WithAuth permission={Permission.Teaching_Course_Access}>
    <DetailClassworkSubmission />
  </WithAuth>
)

export default WithPermissionDetailClassworkSubmission
