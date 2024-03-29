import { FC, useMemo } from 'react'

import { CardContent, Grid, Stack } from '@material-ui/core'
import Rating from '@material-ui/lab/Rating'
import format from 'date-fns/format'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { ANY } from '@kathena/types'
import {
  InfoBlock,
  Link,
  PageContainer,
  PageContainerSkeleton,
  SectionCard,
  Button,
  useDialogState,
  Typography,
} from '@kathena/ui'
import { WithAuth } from 'common/auth'
import {
  Permission,
  useFindLessonByIdQuery,
  useFindRatingQuery,
} from 'graphql/generated'
import QuizDisplayName from 'modules/TeachingCourse/Components/ClassworkLessons/LessonDisplayName/QuizDisplayName'
import {
  buildPath,
  STUDYING_COURSE_DETAIL_CONTENT_CLASSWORK_ASSIGNMENTS,
  STUDYING_COURSE_QUIZ,
  STUDYING_COURSE_DETAIL_CONTENT_CLASSWORK_MATERIALS,
} from 'utils/path-builder'

import AssignmentDisplayName from '../../../TeachingCourse/Components/ClassworkLessons/LessonDisplayName/AssignmentDisplayName'
import MaterialDisplayName from '../../../TeachingCourse/Components/ClassworkLessons/LessonDisplayName/MaterialDisplayName'
import RatingLesson from '../RatingLesson'

export type DetailClassworkLessonProps = {}

const DetailClassworkLesson: FC<DetailClassworkLessonProps> = () => {
  const params: { id: string; courseDetailId: string } = useParams()
  const lessonId = useMemo(() => params.id, [params])
  const { data, loading } = useFindLessonByIdQuery({
    variables: { lessonId },
  })
  const classworkLesson = useMemo(() => data?.findLessonById, [data])
  const { data: dataRating } = useFindRatingQuery({
    variables: {
      targetId: classworkLesson?.id as ANY,
    },
  })
  const coreRating = useMemo(
    () => dataRating?.findRating.numberOfStars,
    [dataRating],
  )
  const [ratingOpen, handleOpenRating, handleCloseRating] = useDialogState()
  if (loading && !data) {
    return <PageContainerSkeleton maxWidth="md" />
  }

  if (!classworkLesson) {
    return (
      <PageContainer maxWidth="md">
        <Typography align="center">
          Buổi học không tồn tại hoặc đã bị xoá.
        </Typography>
      </PageContainer>
    )
  }
  return (
    <PageContainer
      backButtonLabel="Danh sách buổi học"
      withBackButton
      maxWidth="lg"
      title={classworkLesson.description as ANY}
      actions={[
        <Button
          backgroundColorButton="primary"
          onClick={handleOpenRating}
          variant="contained"
        >
          Đánh giá buổi học
        </Button>,
      ]}
    >
      <RatingLesson
        lesson={classworkLesson}
        open={ratingOpen}
        onClose={handleCloseRating}
        coreRating={coreRating as number}
      />
      <Grid container spacing={DASHBOARD_SPACING}>
        {/* Thông tin buổi học */}
        <Grid container item xs={12} spacing={2}>
          <SectionCard
            maxContentHeight={false}
            gridItem={{ xs: 12, md: 12 }}
            title="Thông tin buổi học"
          >
            <CardContent>
              <Grid container spacing={2}>
                <Grid item container xs={12}>
                  <Grid item xs={4}>
                    <Stack spacing={2}>
                      <InfoBlock label="Tiêu đề">
                        {classworkLesson.description}
                      </InfoBlock>
                      <InfoBlock label="Thời gian tạo">
                        <Typography>
                          {format(
                            new Date(classworkLesson.createdAt),
                            'dd/MM/yyyy - h:mm a',
                          )}
                        </Typography>
                      </InfoBlock>
                    </Stack>
                  </Grid>
                  <Grid item xs={4}>
                    <Stack spacing={2}>
                      <InfoBlock label="Trạng thái">
                        {classworkLesson.publicationState}
                      </InfoBlock>
                      <InfoBlock label="Thời gian bắt đầu">
                        <Typography>
                          {format(
                            new Date(classworkLesson.startTime),
                            'dd/MM/yyyy - h:mm a',
                          )}
                        </Typography>
                      </InfoBlock>
                    </Stack>
                  </Grid>
                  <Grid item xs={4}>
                    <Stack spacing={2}>
                      <InfoBlock label="Đánh giá sao">
                        <Rating
                          name="customized-empty"
                          readOnly
                          defaultValue={classworkLesson.avgNumberOfStars}
                          precision={0.5}
                        />
                      </InfoBlock>
                      <InfoBlock label="Thời gian kêt thúc">
                        <Typography>
                          {format(
                            new Date(classworkLesson.endTime),
                            'dd/MM/yyyy - h:mm a',
                          )}
                        </Typography>
                      </InfoBlock>
                    </Stack>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </SectionCard>
          {/* Trước buổi học */}
          {classworkLesson.classworkAssignmentListBeforeClass?.length === 0 &&
          classworkLesson.classworkMaterialListBeforeClass?.length === 0 &&
          classworkLesson.quizListBeforeClass?.length === 0 ? (
            ''
          ) : (
            <SectionCard
              maxContentHeight={false}
              gridItem={{ xs: 12, md: 12 }}
              title="Thông tin trước buổi học"
            >
              <CardContent>
                {classworkLesson.classworkMaterialListBeforeClass?.length ===
                0 ? (
                  <></>
                ) : (
                  <>
                    {/* Danh sách tài liệu trước buổi học */}
                    <Grid item xs={12}>
                      <Stack spacing={2} style={{ display: 'flex' }}>
                        <Typography variant="subtitle2">
                          Danh sách tài liệu
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <CardContent>
                        {classworkLesson.classworkMaterialListBeforeClass
                          ?.length
                          ? classworkLesson.classworkMaterialListBeforeClass.map(
                              (classworkMaterialListBeforeClass) => (
                                <>
                                  <Link
                                    to={buildPath(
                                      STUDYING_COURSE_DETAIL_CONTENT_CLASSWORK_MATERIALS,
                                      {
                                        id: classworkMaterialListBeforeClass,
                                      },
                                    )}
                                  >
                                    <MaterialDisplayName
                                      materialId={
                                        classworkMaterialListBeforeClass
                                      }
                                    />
                                  </Link>
                                </>
                              ),
                            )
                          : 'Không có tài liệu'}
                      </CardContent>
                    </Grid>
                  </>
                )}
                {classworkLesson.classworkAssignmentListBeforeClass?.length ===
                0 ? (
                  <></>
                ) : (
                  <>
                    {/* Danh sách bài tập trước buổi học */}
                    <Grid item xs={12}>
                      <Stack spacing={2} style={{ display: 'flex' }}>
                        <Typography variant="subtitle2">
                          Danh sách bài tập
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <CardContent>
                        {classworkLesson.classworkAssignmentListBeforeClass
                          ?.length
                          ? classworkLesson.classworkAssignmentListBeforeClass.map(
                              (classworkAssignmentListBeforeClass) => (
                                <>
                                  <Link
                                    to={buildPath(
                                      STUDYING_COURSE_DETAIL_CONTENT_CLASSWORK_ASSIGNMENTS,
                                      {
                                        id: classworkAssignmentListBeforeClass,
                                      },
                                    )}
                                  >
                                    <AssignmentDisplayName
                                      assignmentId={
                                        classworkAssignmentListBeforeClass
                                      }
                                    />
                                  </Link>
                                </>
                              ),
                            )
                          : 'Không có bài tập'}
                      </CardContent>
                    </Grid>
                  </>
                )}
                {/* --- */}
                {classworkLesson.quizListBeforeClass?.length === 0 ? (
                  <></>
                ) : (
                  <>
                    {/* Danh sách bài tập trắc nghiệm trước buổi học */}
                    <Grid item xs={12}>
                      <Stack spacing={2} style={{ display: 'flex' }}>
                        <Typography variant="subtitle2">
                          Danh sách bài tập trắc nghiệm
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <CardContent>
                        {classworkLesson.quizListBeforeClass?.length
                          ? classworkLesson.quizListBeforeClass.map(
                              (quizListBeforeClass) => (
                                <>
                                  <Link
                                    to={buildPath(STUDYING_COURSE_QUIZ, {
                                      id: quizListBeforeClass,
                                    })}
                                  >
                                    <QuizDisplayName
                                      quizId={quizListBeforeClass}
                                    />
                                  </Link>
                                </>
                              ),
                            )
                          : 'Không có bài tập'}
                      </CardContent>
                    </Grid>
                  </>
                )}
                {/* -- */}
              </CardContent>
            </SectionCard>
          )}
          {/* Thông tin trong buổi học */}
          {classworkLesson.classworkAssignmentListInClass?.length === 0 &&
          classworkLesson.classworkMaterialListInClass?.length === 0 &&
          classworkLesson.quizListInClass?.length === 0 ? (
            ''
          ) : (
            <SectionCard
              maxContentHeight={false}
              gridItem={{ xs: 12, md: 12 }}
              title="Thông tin trong buổi học"
            >
              <CardContent>
                {classworkLesson.classworkMaterialListInClass?.length === 0 ? (
                  <></>
                ) : (
                  <>
                    {/* Danh sách tài liệu trong buổi học */}
                    <Grid item xs={12}>
                      <Stack spacing={2} style={{ display: 'flex' }}>
                        <Typography variant="subtitle2">
                          Danh sách tài liệu
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <CardContent>
                        {classworkLesson.classworkMaterialListInClass?.length
                          ? classworkLesson.classworkMaterialListInClass.map(
                              (classworkLessonMaterialInClass) => (
                                <>
                                  <Link
                                    to={buildPath(
                                      STUDYING_COURSE_DETAIL_CONTENT_CLASSWORK_MATERIALS,
                                      {
                                        id: classworkLessonMaterialInClass,
                                      },
                                    )}
                                  >
                                    <MaterialDisplayName
                                      materialId={
                                        classworkLessonMaterialInClass
                                      }
                                    />
                                  </Link>
                                </>
                              ),
                            )
                          : 'Không có tài liệu'}
                      </CardContent>
                    </Grid>
                  </>
                )}
                {classworkLesson.classworkAssignmentListInClass?.length ===
                0 ? (
                  <></>
                ) : (
                  <>
                    {/* Danh sách bài tập trong buổi học */}
                    <Grid item xs={12}>
                      <Stack spacing={2} style={{ display: 'flex' }}>
                        <Typography variant="subtitle2">
                          Danh sách bài tập
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <CardContent>
                        {classworkLesson.classworkAssignmentListInClass?.length
                          ? classworkLesson.classworkAssignmentListInClass.map(
                              (classworkAssignmentListInClass) => (
                                <>
                                  <Link
                                    to={buildPath(
                                      STUDYING_COURSE_DETAIL_CONTENT_CLASSWORK_ASSIGNMENTS,
                                      {
                                        id: classworkAssignmentListInClass,
                                      },
                                    )}
                                  >
                                    <AssignmentDisplayName
                                      assignmentId={
                                        classworkAssignmentListInClass
                                      }
                                    />
                                  </Link>
                                </>
                              ),
                            )
                          : 'Không có bài tập'}
                      </CardContent>
                    </Grid>
                  </>
                )}
                {/* --- */}
                {classworkLesson.quizListInClass?.length === 0 ? (
                  <></>
                ) : (
                  <>
                    {/* Danh sách bài tập trắc nghiệm trong buổi học */}
                    <Grid item xs={12}>
                      <Stack spacing={2} style={{ display: 'flex' }}>
                        <Typography variant="subtitle2">
                          Danh sách bài tập trắc nghiệm
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <CardContent>
                        {classworkLesson.quizListInClass?.length
                          ? classworkLesson.quizListInClass.map(
                              (quizListInClass) => (
                                <>
                                  <Link
                                    to={buildPath(STUDYING_COURSE_QUIZ, {
                                      id: quizListInClass,
                                    })}
                                  >
                                    <QuizDisplayName quizId={quizListInClass} />
                                  </Link>
                                </>
                              ),
                            )
                          : 'Không có bài tập'}
                      </CardContent>
                    </Grid>
                  </>
                )}
                {/* -- */}
              </CardContent>
            </SectionCard>
          )}
          {/* Danh sách sau buổi học */}
          {classworkLesson.classworkAssignmentListAfterClass?.length === 0 &&
          classworkLesson.classworkMaterialListAfterClass?.length === 0 &&
          classworkLesson.quizListAfterClass?.length === 0 ? (
            ''
          ) : (
            <SectionCard
              maxContentHeight={false}
              gridItem={{ xs: 12, md: 12 }}
              title="Thông tin sau buổi học"
            >
              <CardContent>
                {classworkLesson.classworkMaterialListAfterClass?.length ===
                0 ? (
                  <></>
                ) : (
                  <>
                    {/* Danh sách tài liệu sau buổi học */}
                    <Grid item xs={12}>
                      <Stack spacing={2} style={{ display: 'flex' }}>
                        <Typography variant="subtitle2">
                          Danh sách tài liệu
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <CardContent>
                        {classworkLesson.classworkMaterialListAfterClass?.length
                          ? classworkLesson.classworkMaterialListAfterClass.map(
                              (classworkMaterialListAfterClass) => (
                                <>
                                  <Link
                                    to={buildPath(
                                      STUDYING_COURSE_DETAIL_CONTENT_CLASSWORK_MATERIALS,
                                      {
                                        id: classworkMaterialListAfterClass,
                                      },
                                    )}
                                  >
                                    <MaterialDisplayName
                                      materialId={
                                        classworkMaterialListAfterClass
                                      }
                                    />
                                  </Link>
                                </>
                              ),
                            )
                          : 'Không có tài liệu'}
                      </CardContent>
                    </Grid>
                  </>
                )}
                {classworkLesson.classworkAssignmentListAfterClass?.length ===
                0 ? (
                  <></>
                ) : (
                  <>
                    {/* Danh sách bài tập sau buổi học */}
                    <Grid item xs={12}>
                      <Stack spacing={2} style={{ display: 'flex' }}>
                        <Typography variant="subtitle2">
                          Danh sách bài tập
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <CardContent>
                        {classworkLesson.classworkAssignmentListAfterClass
                          ?.length
                          ? classworkLesson.classworkAssignmentListAfterClass.map(
                              (classworkAssignmentListAfterClass) => (
                                <>
                                  <Link
                                    to={buildPath(
                                      STUDYING_COURSE_DETAIL_CONTENT_CLASSWORK_ASSIGNMENTS,
                                      {
                                        id: classworkAssignmentListAfterClass,
                                      },
                                    )}
                                  >
                                    <AssignmentDisplayName
                                      assignmentId={
                                        classworkAssignmentListAfterClass
                                      }
                                    />
                                  </Link>
                                </>
                              ),
                            )
                          : 'Không có bài tập'}
                      </CardContent>
                    </Grid>
                  </>
                )}
                {/* --- */}
                {classworkLesson.quizListAfterClass?.length === 0 ? (
                  <></>
                ) : (
                  <>
                    {/* Danh sách bài tập trắc nghiệm sau buổi học */}
                    <Grid item xs={12}>
                      <Stack spacing={2} style={{ display: 'flex' }}>
                        <Typography variant="subtitle2">
                          Danh sách bài tập trắc nghiệm
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <CardContent>
                        {classworkLesson.quizListAfterClass?.length
                          ? classworkLesson.quizListAfterClass.map(
                              (quizListAfterClass) => (
                                <>
                                  <Link
                                    to={buildPath(STUDYING_COURSE_QUIZ, {
                                      id: quizListAfterClass,
                                    })}
                                  >
                                    <QuizDisplayName
                                      quizId={quizListAfterClass}
                                    />
                                  </Link>
                                </>
                              ),
                            )
                          : 'Không có bài tập'}
                      </CardContent>
                    </Grid>
                  </>
                )}
                {/* -- */}
              </CardContent>
            </SectionCard>
          )}
        </Grid>
      </Grid>
    </PageContainer>
  )
}

const WithPermissionDetailClassworkLesson = () => (
  <WithAuth permission={Permission.Studying_Course_Access}>
    <DetailClassworkLesson />
  </WithAuth>
)
export default WithPermissionDetailClassworkLesson
