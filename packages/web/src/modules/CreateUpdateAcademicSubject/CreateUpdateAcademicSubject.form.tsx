/* eslint-disable no-console */
import { FC } from 'react'

import { Grid, makeStyles } from '@material-ui/core'
import { Form, Formik } from 'formik'
import { useSnackbar } from 'notistack'

import yup from '@kathena/libs/yup'
import {
  ApolloErrorList,
  Button,
  TextFormField,
  CurrencyFormField,
} from '@kathena/ui'
import { NAME_ACADEMIC_SUBJECT_REGEX } from 'utils/validators'

export type AcademicSubjectFormInput = {
  name: string
  description: string
  tuitionFee: number | null
}

const error = null

const labels = {
  name: 'Tên môn học',
  description: 'Mô tả',
  tuitionFee: 'Học phí',
}

const validationSchema = yup.object({
  name: yup
    .string()
    .label(labels.name)
    .trim()
    .matches(NAME_ACADEMIC_SUBJECT_REGEX, {
      message: 'Tên môn học chứa các ký tự không phù hợp',
    })
    .required(),
  description: yup.string().label('Mô tả').required(),
  tuitionFee: yup.number().label('Học phí').required(),
})

export type CreateUpdateAcademicSubjectFormProps = {
  initialValues: AcademicSubjectFormInput
  createMode: boolean
}

const CreateUpdateAcademicSubjectForm: FC<CreateUpdateAcademicSubjectFormProps> = (
  props,
) => {
  const classes = useStyles(props)
  const { enqueueSnackbar } = useSnackbar()

  const { initialValues, createMode } = props

  const handleCreateAcademicSubject = (value: AcademicSubjectFormInput) => {
    if (createMode) {
      console.log('Thêm: ')
      console.log(value)
      enqueueSnackbar('Thêm Thành Công', { variant: 'success' })
    } else {
      console.log('Sửa: ')
      console.log(value)
      enqueueSnackbar('Sửa Thành Công', { variant: 'success' })
    }
  }

  return (
    <div className={classes.root}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleCreateAcademicSubject}
      >
        {(formik) => (
          <Form>
            <Grid container spacing={2}>
              <TextFormField
                gridItem={{ xs: 12 }}
                name="name"
                label="Tên môn học"
              />
              <TextFormField
                gridItem={{ xs: 12 }}
                name="description"
                label="Mô tả"
              />
              <CurrencyFormField
                gridItem={{ xs: 12 }}
                name="tuitionFee"
                label="Học phí"
              />
              {error && <ApolloErrorList gridItem={{ xs: 12 }} error={error} />}

              <Button
                gridItem
                variant="contained"
                color="primary"
                loading={formik.isSubmitting}
                type="submit"
                sx={{ mt: 2 }}
              >
                {createMode ? 'Thêm Môn Học' : 'Cập Nhật Môn Học'}
              </Button>
            </Grid>
          </Form>
        )}
      </Formik>
    </div>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default CreateUpdateAcademicSubjectForm
