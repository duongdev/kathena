import { FC, useMemo } from 'react'

import { CardContent, Grid, makeStyles } from '@material-ui/core'
import { Formik } from 'formik'
import { useSnackbar } from 'notistack'
import { CopySimple } from 'phosphor-react'
import { useParams, useHistory } from 'react-router-dom'

import yup from '@kathena/libs/yup'
import { DASHBOARD_SPACING } from '@kathena/theme'
import {
  Button,
  InfoBlock,
  PageContainer,
  renderApolloError,
  SectionCard,
  Typography,
} from '@kathena/ui'
import { useAuth, WithAuth } from 'common/auth'
import {
  CoursesDocument,
  DayOfWeek,
  useCloneCourseMutation,
  useCourseDetailQuery,
} from 'graphql/generated'
import { ACADEMIC_COURSE_LIST } from 'utils/path-builder'

import CloneCourseForm from './CloneCourse.form'

export type CloneCourseProps = {}

export type CourseFormInput = {
  code: string
  name: string
  tuitionFee: number
  lecturerIds: Array<Account>
  startDate: string
  orgOfficeId: string
  daysOfTheWeek: {
    dayOfWeek: DayOfWeek
    startTime: string
    endTime: string
  }[]
}

const labels: { [k in keyof CourseFormInput]: string } = {
  name: 'Tên khóa học',
  code: 'Mã khóa học',
  tuitionFee: 'Học phí',
  lecturerIds: 'Giảng viên',
  startDate: 'Ngày bắt đầu',
  orgOfficeId: 'Chi nhánh',
  daysOfTheWeek: 'Buổi học trong tuần',
}

const validationSchema = yup.object({
  name: yup.string().label(labels.name).trim().required(),
  code: yup.string().label(labels.code).trim().uppercase().required(),
  tuitionFee: yup.number().label(labels.tuitionFee).min(0).required(),
  lecturerIds: yup.array().label(labels.lecturerIds).notRequired(),
  startDate: yup.string().label(labels.startDate).default(''),
  orgOfficeId: yup.string().label(labels.orgOfficeId).trim().required(),
  daysOfTheWeek: yup.array().min(1, 'Phải chọn ít nhất 1 buổi học trong tuần').label(labels.daysOfTheWeek).required()
})

const CloneCourse: FC<CloneCourseProps> = (props) => {
  const classes = useStyles(props)
  const { enqueueSnackbar } = useSnackbar()
  const params: { idCourse: string } = useParams()
  const history = useHistory()
  const idCourse = useMemo(() => params.idCourse, [params.idCourse])
  const { $org: org } = useAuth()
  const { data } = useCourseDetailQuery({
    variables: { id: idCourse }
  })
  const [cloneCourse] = useCloneCourseMutation({
    refetchQueries: [{
      query: CoursesDocument,
      variables: { orgId: org.id, skip: 0, limit: 10 },
    }]
  })
  const courseRoot = useMemo(() => data?.findCourseById, [data?.findCourseById])
  const initialValues: CourseFormInput = {
    code: '',
    name: courseRoot?.name ?? '',
    tuitionFee: courseRoot?.tuitionFee ?? 0,
    lecturerIds: [],
    startDate: '',
    orgOfficeId: courseRoot?.orgOfficeId ?? '',
    daysOfTheWeek: [],
  }

  if (!courseRoot) {
    return (
      <PageContainer maxWidth="md">
        <Typography align="center">
          Khoá học không tồn tại học đã bị xoá.
        </Typography>
      </PageContainer>
    )
  }

  const handleClone = async (input: CourseFormInput) => {
    try {
      if (!courseRoot) return
      const lecturerIds: string[] = []
      if (input.lecturerIds.length)
        input.lecturerIds.map((lecturer) => lecturerIds.push(lecturer.id))
      const { data: dataCreated } = await cloneCourse({
        variables: {
          cloneCourseInput:{
            code: input.code,
            courseIdMustCopy: courseRoot.id,
            name: input.name,
            orgOfficeId: input.orgOfficeId,
            startDate: input.startDate,
            lecturerIds,
            tuitionFee: input.tuitionFee,
            daysOfTheWeek: input.daysOfTheWeek,
          }
        },
      })

      const course = dataCreated?.cloneTheCourse

      if (!course) {
        return
      }
      enqueueSnackbar('Sao chép khóa học thành công', { variant: 'success' })
      history.push(ACADEMIC_COURSE_LIST)
    } catch (error) {
      const errorMessage = renderApolloError(error)()
      enqueueSnackbar(errorMessage, { variant: 'error' })
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={initialValues}
      // eslint-disable-next-line
      onSubmit={handleClone}
    >
      {(formik) => (
        <PageContainer
          title="Sao chép khóa học"
          backButtonLabel="Danh sách khóa học"
          withBackButton={ACADEMIC_COURSE_LIST}
          className={classes.root}
          actions={[
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<CopySimple />}
              onClick={formik.submitForm}
              loading={formik.isSubmitting}
            >
              Clone
            </Button>,
          ]}
        >
          <Grid container spacing={DASHBOARD_SPACING}>
            <SectionCard
              gridItem={{ xs: 4 }}
              fullHeight={false}
              maxContentHeight={false}
              title="Thông tin khoá học gốc"
            >
              <CardContent>
                <InfoBlock label="Code">{courseRoot.code}</InfoBlock>
                <InfoBlock label="Tên khoá học">{courseRoot.name}</InfoBlock>
                <InfoBlock label="Học phí">
                  {courseRoot.tuitionFee}
                </InfoBlock>
              </CardContent>
            </SectionCard>
            <SectionCard
              title="Thông tin khóa học mới"
              gridItem={{ xs: 8 }}
              maxContentHeight={false}
            >
              <CloneCourseForm />
            </SectionCard>
          </Grid>
        </PageContainer>
      )}
    </Formik>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export const courseLabels = labels

const WithPermissionCloneCourse = () => (
  <WithAuth>
    <CloneCourse />
  </WithAuth>
)

export default WithPermissionCloneCourse
