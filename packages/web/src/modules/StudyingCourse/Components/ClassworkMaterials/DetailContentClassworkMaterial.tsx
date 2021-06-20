import { FC, useMemo, useRef, useState } from 'react'

import { CardContent, Grid, makeStyles, Stack } from '@material-ui/core'
import Comment from 'components/Comment/Comment'
import FileComponent from 'components/FileComponent'
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
import { WithAuth } from 'common/auth'
import {
  Permission,
  useCommentsQuery,
  useDetailClassworkMaterialQuery,
} from 'graphql/generated'
import CreateComment from 'modules/CreateComment'

export type DetailContentClassworkMaterialProps = {}

const DetailContentClassworkMaterial: FC<DetailContentClassworkMaterialProps> =
  (props) => {
    const classes = useStyles(props)
    const params: { id: string } = useParams()
    const id = useMemo(() => params.id, [params.id])
    const [lastId, setLastId] = useState<string | null>(null)
    const { data, loading } = useDetailClassworkMaterialQuery({
      variables: { Id: id },
    })
    const { data: dataComments, refetch } = useCommentsQuery({
      variables: {
        targetId: id,
        commentPageOptionInput: {
          limit: 5,
        },
        lastId,
      },
    })
    const classworkMaterial = useMemo(() => data?.classworkMaterial, [data])
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
                <Grid item xs={12}>
                  <Stack spacing={2}>
                    <InfoBlock label="Tiêu đề:">
                      {`${classworkMaterial?.title}`}
                    </InfoBlock>
                    <InfoBlock label="Mô tả:">
                      <div
                        // eslint-disable-next-line
                        dangerouslySetInnerHTML={{
                          __html: classworkMaterial?.description as ANY,
                        }}
                      />
                    </InfoBlock>
                    <InfoBlock label="Tập tin đính kèm: ">
                      {classworkMaterial?.attachments.length ? (
                        classworkMaterial?.attachments.map((attachment) => (
                          <FileComponent key={attachment} fileId={attachment} />
                        ))
                      ) : (
                        <Typography>Không có tập tin</Typography>
                      )}
                    </InfoBlock>
                  </Stack>
                </Grid>
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
                <div
                  style={{ display: 'flex', flexDirection: 'column-reverse' }}
                >
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
              <CreateComment onSuccess={addComment} targetId={id} />
            </CardContent>
          </SectionCard>
        </Grid>
      </PageContainer>
    )
  }

const useStyles = makeStyles(() => ({
  root: {},
}))

const WithPermissionDetailContentClassworkMaterial = () => (
  <WithAuth permission={Permission.Studying_Course_Access}>
    <DetailContentClassworkMaterial />
  </WithAuth>
)
export default WithPermissionDetailContentClassworkMaterial
