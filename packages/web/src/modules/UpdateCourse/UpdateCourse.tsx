import { FC, useCallback, useMemo } from 'react'

import { CardContent, makeStyles, Stack } from '@material-ui/core'
import { Formik } from 'formik'
import { useSnackbar } from 'notistack'
import { Pencil } from 'phosphor-react'
import { useHistory, useParams } from 'react-router-dom'

import yup from '@kathena/libs/yup'
import { ANY } from '@kathena/types'
import {
  Button,
  CurrencyFormField,
  PageContainer,
  SectionCard,
  TextFormField,
} from '@kathena/ui'
import {
  useFindCourseByIdQuery,
  useUpdateCourseMutation,
} from 'graphql/generated'
import { ACADEMIC_COURSE, buildPath } from 'utils/path-builder'

export type UpdateCourseProps = {}
export type CourseFormInput = {
  name: string
  tuitionFee: number
  startDate: string
}
const labels: { [k in keyof CourseFormInput]: string } = {
  name: 'Tên khóa học',
  tuitionFee: 'Học phí',
  startDate: 'Ngày bắt đầu',
}
const validationSchema = yup.object({
  name: yup.string().label(labels.name).trim().required(),
  tuitionFee: yup.number().label(labels.tuitionFee).min(0).required(),
  startDate: yup.string().label(labels.startDate).default(''),
})

const UpdateCourse: FC<UpdateCourseProps> = (props) => {
  const classes = useStyles(props)
  const params: { id: string } = useParams()
  const history = useHistory()
  const { enqueueSnackbar } = useSnackbar()
  const idCourse = useMemo(() => params.id, [params])
  const { data } = useFindCourseByIdQuery({
    variables: { id: idCourse },
  })
  const [updateCourse] = useUpdateCourseMutation()

  const idCourseDetail = useMemo(() => data?.findCourseById, [data])
  const initialValues: ANY = useMemo(
    () => ({
      name: idCourseDetail?.name,
      tuitionFee: idCourseDetail?.tuitionFee,
    }),
    [idCourseDetail?.name, idCourseDetail?.tuitionFee],
  )

  const handleSubmitForm = useCallback(
    async (input: CourseFormInput) => {
      try {
        await updateCourse({
          variables: {
            id: idCourse,
            updateInput: {
              name: input.name,
              tuitionFee: input.tuitionFee,
              startDate: input.startDate,
            },
          },
        })

        enqueueSnackbar('Sửa khóa học thành công', { variant: 'success' })

        history.push(
          buildPath(ACADEMIC_COURSE, {
            id: idCourse,
          }),
        )
      } catch (err) {
        // console.log(err)
        enqueueSnackbar('Sửa khóa học thất bại', { variant: 'error' })
      }
    },
    [enqueueSnackbar, updateCourse, idCourse, history],
  )
  return (
    <div className={classes.root}>
      <Formik
        validationSchema={validationSchema}
        initialValues={initialValues}
        onSubmit={handleSubmitForm}
      >
        {(formik) => (
          <PageContainer
            title="Sửa khóa học"
            backButtonLabel="Chi tiết khóa học"
            withBackButton
            maxWidth="md"
            className={classes.root}
            actions={[
              <Button
                backgroundColorButton="primary"
                variant="contained"
                color="primary"
                size="large"
                startIcon={<Pencil />}
                onClick={formik.submitForm}
                loading={formik.isSubmitting}
              >
                Sửa khóa học
              </Button>,
            ]}
          >
            <SectionCard
              maxContentHeight={false}
              gridItem={{ xs: 12 }}
              title="Thông tin khóa học"
            >
              <CardContent>
                <Stack spacing={2}>
                  <TextFormField
                    required
                    autoFocus
                    name="name"
                    label={labels.name}
                  />
                  <CurrencyFormField
                    required
                    name="tuitionFee"
                    label={labels.tuitionFee}
                  />
                  <TextFormField
                    type="date"
                    required
                    name="startDate"
                    label={labels.startDate}
                  />
                </Stack>
              </CardContent>
            </SectionCard>
          </PageContainer>
        )}
      </Formik>
    </div>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default UpdateCourse
