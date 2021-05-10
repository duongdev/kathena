import { FC, useCallback, useMemo } from 'react'

import { CardContent, makeStyles } from '@material-ui/core'
import AccountAssignerFormField from 'components/AccountAssigner/AccountAssignerFormField'
import { Formik } from 'formik'
import { useSnackbar } from 'notistack'
import { useParams } from 'react-router-dom'

import yup from '@kathena/libs/yup'
import { Button, SectionCard } from '@kathena/ui'
import {
  AddStudentToCourseDocument,
  useAddStudentToCourseMutation,
  useCourseDetailQuery,
} from 'graphql/generated'

export type MenuStudentProps = {
  onClose?: () => void
}
export type StudentFormInput = {
  studentIds: Array<Account>
}
const labels: { [k in keyof StudentFormInput]: string } = {
  studentIds: 'Học viên',
}
const validationSchema = yup.object({
  studentIds: yup.array().label(labels.studentIds).notRequired(),
})
const initialValues: StudentFormInput = {
  studentIds: [],
}

const MenuStudent: FC<MenuStudentProps> = (props) => {
  const { onClose } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles(props)
  const params: { id: string } = useParams()
  const courseId = useMemo(() => params.id, [params.id])
  const { data } = useCourseDetailQuery({
    variables: { id: courseId },
  })
  const courseStudent = useMemo(() => data?.findCourseById, [
    data?.findCourseById,
  ])
  const [addStudentsToCourse] = useAddStudentToCourseMutation({
    refetchQueries: [
      {
        query: AddStudentToCourseDocument,
        variables: {
          courseId,
          studentIds: initialValues.studentIds,
        },
      },
    ],
  })
  const handelAddAndClose = useCallback(
    async (input: StudentFormInput) => {
      try {
        if (!courseStudent?.id || !input?.studentIds) {
          enqueueSnackbar('Thêm học viên thất bại', { variant: 'error' })
          return
        }
        const studentIds: string[] = []
        if (input.studentIds.length) {
          input.studentIds.map((student) => studentIds.push(student.id))
        }
        const { data: dataCreated } = await addStudentsToCourse({
          variables: {
            courseId: courseStudent.id,
            studentIds,
          },
        })
        const student = dataCreated?.addStudentsToCourse
        if (!student) {
          return
        }
        enqueueSnackbar('Thêm học viên thành công', { variant: 'success' })
        onClose?.()
        return
      } catch (error) {
        enqueueSnackbar(
          'Thêm thất bại: Học viên đã có trong danh sách khóa học',
          { variant: 'error' },
        )
        onClose?.()
      }
    },
    [enqueueSnackbar, onClose, addStudentsToCourse, courseStudent],
  )
  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={initialValues}
      onSubmit={handelAddAndClose}
    >
      {(formik) => (
        <SectionCard
          gridItem={{ xs: 12 }}
          fullHeight={false}
          maxContentHeight={false}
          title="Danh sách học viên"
          action={
            <Button
              variant="text"
              size="medium"
              color="primary"
              onClick={formik.submitForm}
              loading={formik.isSubmitting}
            >
              Thêm
            </Button>
          }
        >
          <CardContent>
            <AccountAssignerFormField
              className={classes.root}
              name="studentIds"
              label={labels.studentIds}
              roles={['student']}
              multiple
            />
          </CardContent>
        </SectionCard>
      )}
    </Formik>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default MenuStudent
