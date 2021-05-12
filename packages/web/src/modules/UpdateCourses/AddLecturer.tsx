import { FC, useCallback, useMemo } from 'react'

import { CardContent, makeStyles } from '@material-ui/core'
import AccountAssignerFormField from 'components/AccountAssigner/AccountAssignerFormField'
import { Formik } from 'formik'
import { useSnackbar } from 'notistack'
import { useParams } from 'react-router-dom'

import yup from '@kathena/libs/yup'
import { Button, SectionCard } from '@kathena/ui'
import {
  useAddLecturesToCourseMutation,
  useCourseDetailQuery,
} from 'graphql/generated'

export type CurrentMenuProps = {
  onClose?: () => void
}
export type LecturerFormInput = {
  lecturerIds: Array<Account>
}
const labels: { [k in keyof LecturerFormInput]: string } = {
  lecturerIds: 'Giảng viên',
}
const validationSchema = yup.object({
  lecturerIds: yup.array().label(labels.lecturerIds).required(),
})
const initialValues: LecturerFormInput = {
  lecturerIds: [],
}

const CurrentMenu: FC<CurrentMenuProps> = (props) => {
  const { onClose } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles(props)
  const params: { id: string } = useParams()
  const courseId = useMemo(() => params.id, [params.id])
  const { data } = useCourseDetailQuery({
    variables: { id: courseId },
  })
  const courseLecturer = useMemo(() => data?.findCourseById, [
    data?.findCourseById,
  ])
  const [addLecturesToCourse] = useAddLecturesToCourseMutation()
  const handelAddAndClose = useCallback(
    async (input: LecturerFormInput) => {
      try {
        if (!courseLecturer?.id || input.lecturerIds.length <= 0) {
          enqueueSnackbar('Thêm giảng viên thất bại', { variant: 'error' })
          return
        }
        const lecturerIds: string[] = []
        if (input.lecturerIds.length) {
          input.lecturerIds.map((lecturer) => lecturerIds.push(lecturer.id))
        }
        const { data: dataCreated } = await addLecturesToCourse({
          variables: {
            courseId: courseLecturer.id,
            lecturerIds,
          },
        })
        const lecturer = dataCreated?.addLecturesToCourse
        if (!lecturer) {
          return
        }
        enqueueSnackbar('Thêm giảng viên thành công', { variant: 'success' })
        onClose?.()
        return
      } catch (error) {
        enqueueSnackbar(
          'Thêm thất bại: Giảng viên đã có trong danh sách khóa học',
          { variant: 'error' },
        )
        onClose?.()
      }
    },
    [enqueueSnackbar, onClose, addLecturesToCourse, courseLecturer],
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
          title="Danh sách giảng viên"
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
              filterSelectedOptions
              className={classes.root}
              name="lecturerIds"
              label={labels.lecturerIds}
              roles={['lecturer']}
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

export default CurrentMenu
