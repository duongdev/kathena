import { FC, useCallback, useMemo } from 'react'

import { makeStyles } from '@material-ui/core'
import { Formik } from 'formik'
import { useSnackbar } from 'notistack'
import { Check } from 'phosphor-react'
import { useHistory, useParams } from 'react-router-dom'

import yup, { SchemaOf } from '@kathena/libs/yup'
import { ANY } from '@kathena/types'
import { Button, PageContainer, renderApolloError } from '@kathena/ui'
import { useAuth, WithAuth } from 'common/auth'
import {
  useCreateClassworkMaterialMutation,
  Permission,
  ClassworkAssignmentListDocument,
} from 'graphql/generated'
import {
  buildPath,
  TEACHING_COURSE_CLASSWORK_MATERIALS,
} from 'utils/path-builder'

import CreateClassworkMaterialForm from './CreateClassworkMaterials.from'

export type CreateClassworkMaterialProps = {}

export type ClassworkMaterialFormInput = {
  title: string
  description: string
  createdAt: string
  attachments: File[] | null
}

const labels: { [k in keyof ClassworkMaterialFormInput]: string } = {
  title: 'Tiêu đề',
  description: 'Mô tả',
  createdAt: 'Ngày tạo',
  attachments: 'Tập tin đính kèm',
}

const validationSchema: SchemaOf<ClassworkMaterialFormInput> = yup.object({
  title: yup.string().label(labels.title).trim().required(),
  description: yup.string().label(labels.description).required(),
  createdAt: yup.string().label(labels.createdAt).trim().required(),
  attachments: yup.mixed().label(labels.attachments).required() as ANY,
})

const initialValues = {
  title: '',
  description: '',
  createdAt: '',
  attachments: null,
}

const CreateClassworkMaterial: FC<CreateClassworkMaterialProps> = (props) => {
  const classes = useStyles(props)
  const params: { id: string } = useParams()
  const idCourse = useMemo(() => params.id, [params])
  const { enqueueSnackbar } = useSnackbar()
  const history = useHistory()
  const { $org: org } = useAuth()
  const [createClassworkMaterial] = useCreateClassworkMaterialMutation({
    refetchQueries: [
      {
        query: ClassworkAssignmentListDocument,
        variables: { orgId: org.id, skip: 0, limit: 10, courseId: idCourse },
      },
    ],
    context: { hasFileUpload: true },
  })

  const handleCreateAcademicSubject = useCallback(
    async (input: ClassworkMaterialFormInput) => {
      try {
        if (!idCourse) return
        const dataCreated = (
          await createClassworkMaterial({
            variables: {
              courseId: idCourse,
              CreateClassworkMaterialInput: input as ANY,
            },
          })
        ).data

        const classworkMaterial = dataCreated?.createClassworkMaterial

        if (!classworkMaterial) {
          return
        }
        enqueueSnackbar('Thêm tài liệu thành công', { variant: 'success' })
        history.push(
          buildPath(TEACHING_COURSE_CLASSWORK_MATERIALS, {
            id: idCourse,
          }),
        )
        // eslint-disable-next-line no-console
        console.log(classworkMaterial)
      } catch (error) {
        const errorMessage = renderApolloError(error)()
        enqueueSnackbar(errorMessage, { variant: 'error' })
        // eslint-disable-next-line no-console
        console.error(error)
      }
    },
    [createClassworkMaterial, enqueueSnackbar, idCourse, history],
  )

  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={initialValues}
      onSubmit={handleCreateAcademicSubject}
    >
      {(formik) => (
        <PageContainer
          title="Thêm tài liệu mới"
          backButtonLabel="Danh sách tài liệu"
          withBackButton={buildPath(TEACHING_COURSE_CLASSWORK_MATERIALS, {
            id: idCourse,
          })}
          actions={[
            <Button
              variant="contained"
              color="primary"
              startIcon={<Check />}
              onClick={formik.submitForm}
              loading={formik.isSubmitting}
            >
              Tạo tài liệu
            </Button>,
          ]}
          className={classes.root}
        >
          <CreateClassworkMaterialForm />
        </PageContainer>
      )}
    </Formik>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export const classworkMaterialLabels = labels

const WithPermissionCreateClassworkMaterial = () => (
  <WithAuth permission={Permission.Teaching_Course_Access}>
    <CreateClassworkMaterial />
  </WithAuth>
)

export default WithPermissionCreateClassworkMaterial
