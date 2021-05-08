import { FC, useCallback, useMemo } from 'react'

import { CardContent, makeStyles } from '@material-ui/core'
import AccountAssignerFormField from 'components/AccountAssigner/AccountAssignerFormField'
import { Formik } from 'formik'
import { useSnackbar } from 'notistack'
import { useHistory, useParams } from 'react-router-dom'

import yup from '@kathena/libs/yup'
import { SectionCard, Button } from '@kathena/ui'
import {
  useFindCourseByIdQuery,
  useAddLecturesToCourseMutation,
  AddLecturesToCourseDocument,
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
  lecturerIds: yup.array().label(labels.lecturerIds).notRequired(),
})
const initialValues: LecturerFormInput = {
  lecturerIds: [],
}

const CurrentMenu: FC<CurrentMenuProps> = (props) => {
  const { onClose } = props
  const { enqueueSnackbar } = useSnackbar()

  const classes = useStyles(props)

  const params: { idCourse: string } = useParams()
  const idCourse = useMemo(() => params.idCourse, [params.idCourse])
  const { data } = useFindCourseByIdQuery({
    variables: {
      id: idCourse,
    },
  })
  const courseLecturer = useMemo(() => data?.findCourseById, [
    data?.findCourseById,
  ])
  console.log(`courseLecturer: ${params.idCourse}`)
  const [addLecturer] = useAddLecturesToCourseMutation({
    refetchQueries: [
      {
        query: AddLecturesToCourseDocument,
        variables: { idCourse, courseLecturer },
      },
    ],
  })
  const handelAddAndClose = useCallback(
    async (input: LecturerFormInput) => {
      try {
        if (!input.lecturerIds.length) {
          // console.log("input.lecturerIds", input.lecturerIds)
          enqueueSnackbar('Thêm giảng viên thất bại', { variant: 'error' })
          onClose?.()
          return
        }
        const lecturerIds: string[] = []
        if (input.lecturerIds) {
          input.lecturerIds.map((lecturer) => lecturerIds.push(lecturer.id))
        }
        console.log('lecturerIds', lecturerIds)
        console.log('params.idCourse', courseLecturer?.code)

        const { data: dataCreated } = await addLecturer({
          variables: {
            // name: input.lecturerIds,
            lecturerIds,
            courseId: params.idCourse,
          },
        })
        enqueueSnackbar('Thêm giảng viên thành công', { variant: 'success' })
        onClose?.()
      } catch (error) {
        enqueueSnackbar('Thêm giảng viên thất bại', { variant: 'error' })
        onClose?.()
      }
    },
    [enqueueSnackbar, onClose, addLecturer, courseLecturer, params.idCourse],
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
