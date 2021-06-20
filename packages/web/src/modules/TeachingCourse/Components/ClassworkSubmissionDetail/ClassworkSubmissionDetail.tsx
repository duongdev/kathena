import { FC, useMemo, useState, useRef } from 'react'

import { CardContent, Grid, makeStyles } from '@material-ui/core'
import { useAccountDisplayName } from 'components/AccountDisplayName'
import { useClassworkAssignmentTitle } from 'components/ClassworkAssignmentTitle'
import Comment from 'components/Comment/Comment'
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
  useDialogState,
  StatusChip,
} from '@kathena/ui'
import {
  useCommentsQuery,
  useFindClassworkSubmissionByIdQuery,
} from 'graphql/generated'
import CreateComment from 'modules/CreateComment'

import GradeDialog from './GradeDialog'

export type ClassworkSubmissionDetailProps = {}

const ClassworkSubmissionDetail: FC<ClassworkSubmissionDetailProps> = (
  props,
) => {
  const classes = useStyles(props)

  const params: { id: string } = useParams()
  const idSubmission = useMemo(() => params.id, [params.id])
  const [lastId, setLastId] = useState<string | null>(null)
  const [gradeDialogOpen, handleOpenGradeDialog, handleCloseGradeDialog] =
    useDialogState()
  const { data, loading } = useFindClassworkSubmissionByIdQuery({
    variables: { classworkSubmissionId: idSubmission },
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

  const { data: dataComments, refetch } = useCommentsQuery({
    variables: {
      targetId: classworkSubmission?.id ?? '',
      commentPageOptionInput: {
        limit: 5,
      },
      lastId,
    },
  })

  const comments = useMemo(
    () => dataComments?.comments.comments ?? [],
    [dataComments?.comments.comments],
  )

  const totalComments = useMemo(
    () => dataComments?.comments.count,
    [dataComments?.comments.count],
  )

  const preComments = useRef<ANY[]>(comments)
  const nextComments = useRef<ANY[]>([])

  const loadMoreComments = (lastCommentId: string) => {
    preComments.current = [...preComments.current, ...comments]
    setLastId(lastCommentId)
    refetch()
  }

  const addComment = (comment: ANY) => {
    if (lastId) nextComments.current.push(comment)
    refetch()
  }

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
      actions={[
        <Button onClick={handleOpenGradeDialog} variant="contained">
          {classworkSubmission.grade > 0 ? 'Chấm lại' : 'Chấm điểm'}
        </Button>,
      ]}
    >
      <GradeDialog
        submissionId={classworkSubmission.id}
        open={gradeDialogOpen}
        onClose={handleCloseGradeDialog}
      />
      <Grid container spacing={DASHBOARD_SPACING}>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 12 }}
          title={`Thông tin nộp bài của học viên: ${creatorName}`}
          action={
            <StatusChip variant="contained">
              Điểm: {classworkSubmission.grade}
            </StatusChip>
          }
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
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 12 }}
          title="Bình luận"
        >
          <CardContent>
            {comments?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column-reverse' }}>
                {lastId &&
                  nextComments.current.map((comment) => (
                    <Comment
                      comment={{
                        id: comment.id,
                        createdByAccountId: comment.createdByAccountId,
                        createdAt: comment.createdAt,
                        content: comment.content,
                      }}
                    />
                  ))}
                {preComments.current.map((comment) => (
                  <Comment
                    comment={{
                      id: comment.id,
                      createdByAccountId: comment.createdByAccountId,
                      createdAt: comment.createdAt,
                      content: comment.content,
                    }}
                  />
                ))}
                {comments.map((comment) => (
                  <Comment
                    comment={{
                      id: comment.id,
                      createdByAccountId: comment.createdByAccountId,
                      createdAt: comment.createdAt,
                      content: comment.content,
                    }}
                  />
                ))}
                <Button
                  disabled={
                    comments.length +
                      preComments.current.length +
                      nextComments.current.length ===
                    totalComments
                  }
                  onClick={() =>
                    loadMoreComments(comments[comments.length - 1].id)
                  }
                >
                  Xem thêm
                </Button>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '10px',
                }}
              >
                <Typography>Không có comment</Typography>
              </div>
            )}
            <CreateComment
              onSuccess={addComment}
              targetId={classworkSubmission.id}
            />
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
