import { FC, useCallback, useMemo } from 'react'

import { CardContent, Grid, makeStyles } from '@material-ui/core'
import { Formik } from 'formik'
import { useSnackbar } from 'notistack'
import { Check } from 'phosphor-react'
import { useHistory, useParams } from 'react-router-dom'

import yup from '@kathena/libs/yup'
import { DASHBOARD_SPACING } from '@kathena/theme'
import {
  Button,
  InfoBlock,
  PageContainer,
  renderApolloError,
  SectionCard,
} from '@kathena/ui'
import { useAuth, WithAuth } from 'common/auth'
import {
  useFindAcademicSubjectByIdQuery,
  useCreateCourseMutation,
  CoursesDocument,
  Permission,
} from 'graphql/generated'
import { ACADEMIC_COURSE_LIST } from 'utils/path-builder'

import CreateCourseForm from './CreateCourse.form'

export type CreateCourseProps = {}

export type CourseFormInput = {
  code: string
  name: string
  tuitionFee: number
  lecturerIds: Array<Account>
  startDate: string
}

const labels: { [k in keyof CourseFormInput]: string } = {
  name: 'Tên khóa học',
  code: 'Mã khóa học',
  tuitionFee: 'Học phí',
  lecturerIds: 'Giảng viên',
  startDate: 'Ngày bắt đầu',
}

const validationSchema = yup.object({
  name: yup.string().label(labels.name).trim().required(),
  code: yup.string().label(labels.code).trim().uppercase().required(),
  tuitionFee: yup.number().label(labels.tuitionFee).min(0).required(),
  lecturerIds: yup.array().label(labels.lecturerIds).notRequired(),
  startDate: yup.string().label(labels.startDate).default(''),
})

const CreateCourse: FC<CreateCourseProps> = (props) => {
  const classes = useStyles(props)
  const { enqueueSnackbar } = useSnackbar()
  const params: { idSubject: string } = useParams()
  const history = useHistory()
  const idSubject = useMemo(() => params.idSubject, [params.idSubject])
  const { $org: org } = useAuth()
  const { data } = useFindAcademicSubjectByIdQuery({
    variables: {
      Id: idSubject,
    },
  })
  const academicSubject = useMemo(() => data?.academicSubject, [
    data?.academicSubject,
  ])
  const [createCourse] = useCreateCourseMutation({
    refetchQueries: [
      {
        query: CoursesDocument,
        variables: { orgId: org.id, skip: 0, limit: 10 },
      },
    ],
  })
  const initialValues: CourseFormInput = {
    code: '',
    name: '',
    tuitionFee: 0,
    lecturerIds: [],
    startDate: '',
  }

  const handleSubmitForm = useCallback(
    async (input: CourseFormInput) => {
      try {
        if (!academicSubject) return
        const lecturerIds: string[] = []
        if (input.lecturerIds.length)
          input.lecturerIds.map((lecturer) => lecturerIds.push(lecturer.id))
        const { data: dataCreated } = await createCourse({
          variables: {
            input: {
              academicSubjectId: academicSubject.id,
              code: input.code,
              name: input.name,
              startDate: input.startDate,
              tuitionFee: input.tuitionFee,
              lecturerIds,
            },
          },
        })

        const course = dataCreated?.createCourse

        if (!course) {
          return
        }
        enqueueSnackbar('Thêm khóa học thành công', { variant: 'success' })
        history.push(ACADEMIC_COURSE_LIST)
        // eslint-disable-next-line no-console
        console.log(academicSubject)
      } catch (error) {
        const errorMessage = renderApolloError(error)()
        enqueueSnackbar(errorMessage, { variant: 'error' })
        // eslint-disable-next-line no-console
        console.error(error)
      }
    },
    [createCourse, academicSubject, enqueueSnackbar, history],
  )

  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={initialValues}
      onSubmit={handleSubmitForm}
    >
      {(formik) => (
        <PageContainer
          title="Thêm khóa học mới"
          backButtonLabel="Danh sách khóa học"
          withBackButton={ACADEMIC_COURSE_LIST}
          className={classes.root}
          actions={[
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<Check />}
              onClick={formik.submitForm}
              loading={formik.isSubmitting}
            >
              Tạo khóa học
            </Button>,
          ]}
        >
          <Grid container spacing={DASHBOARD_SPACING}>
            <SectionCard
              gridItem={{ xs: 4 }}
              fullHeight={false}
              maxContentHeight={false}
              title="Thông tin môn học"
            >
              <CardContent>
                <InfoBlock label="Code">{academicSubject?.code}</InfoBlock>
                <InfoBlock label="Name">{academicSubject?.name}</InfoBlock>
                <InfoBlock label="Description">
                  {academicSubject?.description}
                </InfoBlock>
              </CardContent>
            </SectionCard>
            <SectionCard
              title="Thông tin khóa học"
              gridItem={{ xs: 8 }}
              maxContentHeight={false}
            >
              <CreateCourseForm />
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

const WithPermissionCreateCourse = () => (
  <WithAuth permission={Permission.Academic_CreateCourse}>
    <CreateCourse />
  </WithAuth>
)

export default WithPermissionCreateCourse
