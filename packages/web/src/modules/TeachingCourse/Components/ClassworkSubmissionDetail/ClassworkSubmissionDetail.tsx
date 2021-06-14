import { FC, useMemo } from 'react'

import { CardContent, Grid, makeStyles } from '@material-ui/core'
import { useAccountDisplayName } from 'components/AccountDisplayName'
import { useClassworkAssignmentTitle } from 'components/ClassworkAssignmentTitle'
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
import { useFindClassworkSubmissionByIdQuery } from 'graphql/generated'

export type ClassworkSubmissionDetailProps = {}

const ClassworkSubmissionDetail: FC<ClassworkSubmissionDetailProps> = (
  props,
) => {
  const classes = useStyles(props)

  const params: { id: string } = useParams()
  const idStudent = useMemo(() => params.id, [params.id])

  const { data, loading } = useFindClassworkSubmissionByIdQuery({
    variables: { classworkSubmissionId: idStudent },
  })
  const classworkSubmission = useMemo(
    () => data?.findClassworkSubmissionById,
    [data],
  )
  const creatorName = useAccountDisplayName(
    classworkSubmission ? classworkSubmission?.createdByAccountId : '',
  )
  const classworkTitle = useClassworkAssignmentTitle(
    classworkSubmission ? classworkSubmission.classworkId : '',
  )

  if (loading && !data) {
    return <PageContainerSkeleton maxWidth="md" />
  }

  if (!classworkSubmission) {
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
      title={`${classworkTitle}`}
      actions={[<Button variant="contained">Chấm điểm</Button>]}
    >
      <Grid container spacing={DASHBOARD_SPACING}>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 12 }}
          title={`Thông tin nộp bài của học viên: ${creatorName}`}
        >
          <CardContent className={classes.root}>
            <Grid container spacing={1}>
              <InfoBlock gridItem={{ xs: 12 }} label="Nội dung: ">
                {classworkSubmission.description ? (
                  <div
                    // eslint-disable-next-line
                    dangerouslySetInnerHTML={{
                      __html: classworkSubmission.description as ANY,
                    }}
                  />
                ) : (
                  <Typography>Không có nội dung</Typography>
                )}
              </InfoBlock>
              <InfoBlock gridItem={{ xs: 12 }} label="Thời gian nộp bài tập: ">
                {format(new Date(classworkSubmission.createdAt), 'MM/dd/yyyy')}
              </InfoBlock>
              <InfoBlock gridItem={{ xs: 12 }} label="Bài tập của học viên:">
                {classworkSubmission.submissionFileIds.length ? (
                  classworkSubmission.submissionFileIds.map((attachment) => (
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

export default ClassworkSubmissionDetail
