import { FC, useCallback, useMemo } from 'react'

import { makeStyles } from '@material-ui/core'
import { Formik } from 'formik'
import { useSnackbar } from 'notistack'
import { Check } from 'phosphor-react'
import { useHistory, useParams } from 'react-router-dom'

import yup, { SchemaOf } from '@kathena/libs/yup'
import { ANY } from '@kathena/types'
import { Button, PageContainer } from '@kathena/ui'
import { useAuth, WithAuth } from 'common/auth'
import {
  useCreateClassworkMaterialMutation,
  Permission,
  ClassworkMaterialsListDocument,
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
  publicationState: string
  attachments: File[] | null
}

const labels: { [k in keyof ClassworkMaterialFormInput]: string } = {
  title: 'Tiêu đề',
  description: 'Mô tả',
  attachments: 'Tập tin đính kèm',
  publicationState: 'Trạng thái',
}

const validationSchema: SchemaOf<ClassworkMaterialFormInput> = yup.object({
  title: yup.string().label(labels.title).trim().required(),
  description: yup.string().label(labels.description).required(),
  publicationState: yup
    .string()
    .label(labels.publicationState)
    .trim()
    .required(),
  attachments: yup.mixed().label(labels.attachments).notRequired() as ANY,
})

const initialValues = {
  title: '',
  description: '',
  publicationState: '',
  attachments: null,
}

const CreateClassworkMaterial: FC<CreateClassworkMaterialProps> = (props) => {
  const classes = useStyles(props)
  const params: { id: string } = useParams()
  const idCourse = useMemo(() => params.id, [params.id])
  const { enqueueSnackbar } = useSnackbar()
  const history = useHistory()
  const { $org: org } = useAuth()
  const [createClassworkMaterial] = useCreateClassworkMaterialMutation({
    refetchQueries: [
      {
        query: ClassworkMaterialsListDocument,
        variables: { orgId: org.id, skip: 0, limit: 10, courseId: idCourse },
      },
    ],
    context: { hasFileUpload: true },
  })

  const handleCreateAcademicSubject = useCallback(
    async (input: ClassworkMaterialFormInput) => {
      try {
        await createClassworkMaterial({
          variables: {
            courseId: idCourse,
            CreateClassworkMaterialInput: {
              title: input.title,
              description: input.description,
              publicationState: input.publicationState as ANY,
            },
          },
        })

        enqueueSnackbar('Thêm tài liệu thành công', { variant: 'success' })
        history.push(
          buildPath(TEACHING_COURSE_CLASSWORK_MATERIALS, {
            id: idCourse,
          }),
        )
      } catch (err) {
        enqueueSnackbar('Thêm tài liệu thất bại', { variant: 'error' })
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
