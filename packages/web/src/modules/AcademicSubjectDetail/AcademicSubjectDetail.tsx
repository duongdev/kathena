import { FC, useMemo } from 'react'

import { CardContent, Grid, makeStyles, Stack } from '@material-ui/core'
import Image from 'components/Image'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import {
  Button,
  InfoBlock,
  PageContainer,
  PageContainerSkeleton,
  SectionCard,
  Typography,
  useDialogState,
} from '@kathena/ui'
import { WithAuth, RequiredPermission } from 'common/auth'
import { Permission, useAcademicSubjectDetailQuery } from 'graphql/generated'
import {
  buildPath,
  CREATE_ACADEMIC_COURSE,
  UPDATE_ACADEMIC_SUBJECT,
  ACADEMIC_SUBJECTS,
} from 'utils/path-builder'

import UpdateImageAcademicSubjectDialog from './components/UpdateImageAcademicSubjectDialog'

export type AcademicSubjectDetailProps = {}

const AcademicSubjectDetail: FC<AcademicSubjectDetailProps> = (props) => {
  const classes = useStyles(props)
  const [
    updateImageDialogOpen,
    handleOpenUpdateImageDialog,
    handleCloseUpdateImageDialog,
  ] = useDialogState()
  const params: { id: string } = useParams()
  const id = useMemo(() => params.id, [params])
  const { data, loading } = useAcademicSubjectDetailQuery({
    variables: { id },
  })

  const subject = useMemo(() => data?.academicSubject, [data])

  if (loading && !data) {
    return <PageContainerSkeleton maxWidth="md" />
  }

  if (!subject) {
    return (
      <PageContainer maxWidth="md">
        <Typography align="center">
          Môn học không tồn tại học đã bị xoá.
        </Typography>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      backButtonLabel="Danh sách môn học"
      withBackButton={ACADEMIC_SUBJECTS}
      maxWidth="md"
      title={subject.name}
      actions={[
        <RequiredPermission
          permission={Permission.Academic_AcademicSubject_Access}
        >
          <Button
            variant="contained"
            link={buildPath(UPDATE_ACADEMIC_SUBJECT, { id: subject.id })}
          >
            Sửa môn học
          </Button>
          ,
          <Button
            variant="contained"
            link={buildPath(CREATE_ACADEMIC_COURSE, {
              idSubject: subject.id,
            })}
          >
            Thêm khóa học
          </Button>
          ,
        </RequiredPermission>,
      ]}
    >
      <Grid container spacing={DASHBOARD_SPACING}>
        <SectionCard
          maxContentHeight={false}
          gridItem={{ xs: 12 }}
          title="Thông tin môn học"
        >
          <UpdateImageAcademicSubjectDialog
            imageId={subject.imageFileId}
            onClose={handleCloseUpdateImageDialog}
            open={updateImageDialogOpen}
          />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={5} className={classes.imgSubject}>
                <Image
                  fileId={subject.imageFileId}
                  style={{ height: '100%', width: '100%' }}
                  variant="background"
                  actions={[
                    <RequiredPermission
                      permission={Permission.Academic_AcademicSubject_Access}
                    >
                      <Button onClick={handleOpenUpdateImageDialog}>
                        Sửa hình ảnh
                      </Button>
                    </RequiredPermission>,
                  ]}
                />
              </Grid>
              <Grid item xs={12} md={7}>
                <Stack spacing={2}>
                  <InfoBlock label="Mã môn học">{subject.code}</InfoBlock>
                  <InfoBlock label="Tên môn học">{subject.name}</InfoBlock>
                  <InfoBlock label="Mô tả">{subject.description}</InfoBlock>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </SectionCard>
      </Grid>
    </PageContainer>
  )
}

const useStyles = makeStyles(() => ({
  imgSubject: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}))

const WithPermissionAcademicSubjectDetail = () => (
  <WithAuth
    permission={
      Permission.Academic_ListAcademicSubjects ||
      Permission.Teaching_Course_Access
    }
  >
    <AcademicSubjectDetail />
  </WithAuth>
)

export default WithPermissionAcademicSubjectDetail
