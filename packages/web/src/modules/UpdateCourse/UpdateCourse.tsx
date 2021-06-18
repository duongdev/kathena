/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { FC, useCallback, useMemo } from 'react'

import { CardContent, makeStyles, Stack } from '@material-ui/core'
import AccountAssignerFormField from 'components/AccountAssigner/AccountAssignerFormField'
import { Formik } from 'formik'
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
import { useFindCourseByIdQuery } from 'graphql/generated'
import { ACADEMIC_COURSE } from 'utils/path-builder'

export type UpdateCourseProps = {}
export type CourseFormInput = {
  name: string
  tuitionFee: number
  lecturerIds: Array<Account>
  startDate: string
}
const labels: { [k in keyof CourseFormInput]: string } = {
  name: 'Tên khóa học',
  tuitionFee: 'Học phí',
  lecturerIds: 'Giảng viên',
  startDate: 'Ngày bắt đầu',
}
const validationSchema = yup.object({
  name: yup.string().label(labels.name).trim().required(),
  tuitionFee: yup.number().label(labels.tuitionFee).min(0).required(),
  lecturerIds: yup.array().label(labels.lecturerIds).notRequired(),
  startDate: yup.string().label(labels.startDate).default(''),
})

const UpdateCourse: FC<UpdateCourseProps> = (props) => {
  const classes = useStyles(props)
  const params: { id: string } = useParams()
  const idCourse = useMemo(() => params.id, [params])
  const { data, loading } = useFindCourseByIdQuery({
    variables: { id: idCourse },
  })

  const idCourseDetail = useMemo(() => data?.findCourseById, [data])
  const initialValues: ANY = useMemo(
    () => ({
      name: idCourseDetail?.name,
      tuitionFee: idCourseDetail?.tuitionFee,
      lecturerIds: idCourseDetail?.lecturerIds,
      startDate: idCourseDetail?.startDate,
    }),
    [
      idCourseDetail?.name,
      idCourseDetail?.tuitionFee,
      idCourseDetail?.lecturerIds,
      idCourseDetail?.startDate,
    ],
  )

  const handleSubmitForm = useCallback(async (input: CourseFormInput) => {
    try {
      console.error('hoang')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }, [])
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
                  <AccountAssignerFormField
                    name="lecturerIds"
                    label={labels.lecturerIds}
                    roles={['lecturer']}
                    multiple
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
