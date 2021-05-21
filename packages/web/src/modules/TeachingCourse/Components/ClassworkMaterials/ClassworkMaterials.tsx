import { FC, useMemo } from 'react'

import { CardContent, Grid, makeStyles, IconButton } from '@material-ui/core'
import { FilePlus, File, DotsThreeVertical } from 'phosphor-react'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import {
  Button,
  SectionCard,
  SectionCardSkeleton,
  useDialogState,
  Typography,
} from '@kathena/ui'
import { useCourseDetailQuery } from 'graphql/generated'

import CreateAttachmentDialog from './CreateAttachmentDialog'

export type ClassworkMaterialsProps = {}

const ClassworkMaterials: FC<ClassworkMaterialsProps> = (props) => {
  const classes = useStyles(props)
  const [createDialogOpen, handleOpenCreateDialog, handleCloseCreateDialog] =
    useDialogState()

  const params: { id: string } = useParams()
  const courseId = useMemo(() => params.id, [params])
  const { data, loading } = useCourseDetailQuery({
    variables: { id: courseId },
  })
  const course = useMemo(() => data?.findCourseById, [data])

  if (loading) {
    return (
      <Grid container spacing={DASHBOARD_SPACING}>
        <Grid item xs={12}>
          <SectionCardSkeleton />
        </Grid>
      </Grid>
    )
  }

  if (!course) {
    return <div>Course not found</div>
  }

  return (
    <Grid container spacing={DASHBOARD_SPACING}>
      <SectionCard
        title="Tài liệu"
        gridItem={{ xs: 12 }}
        action={
          <>
            <Button
              startIcon={<FilePlus size={25} />}
              size="small"
              onClick={handleOpenCreateDialog}
            >
              Thêm tài liệu
            </Button>
          </>
        }
      >
        <CreateAttachmentDialog
          open={createDialogOpen}
          onClose={handleCloseCreateDialog}
        />
        <CardContent>
          {/* Mốt sẽ xổ danh sách tài liệu tại đây */}
          <Grid container className={classes.root}>
            <Grid item md={1}>
              <File size={30} />
            </Grid>
            <Grid item md={8}>
              <Typography variant="body1">Giới thiệu nhập môn C++</Typography>
            </Grid>
            <Grid item md={2}>
              <Typography variant="body1">Đã đăng vào 14:20</Typography>
            </Grid>
            <Grid item md={1}>
              <IconButton>
                <DotsThreeVertical size={30} />
              </IconButton>
            </Grid>
          </Grid>
        </CardContent>
      </SectionCard>
    </Grid>
  )
}
const useStyles = makeStyles({
  root: {
    alignItems: 'center',
    margin: 'auto',
  },
})
export default ClassworkMaterials
