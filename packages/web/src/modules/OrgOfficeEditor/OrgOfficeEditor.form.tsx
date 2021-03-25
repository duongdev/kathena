/* eslint-disable no-console */
import { FC } from 'react'

import { Grid, makeStyles } from '@material-ui/core'
import { Form, Formik } from 'formik'
import { useSnackbar } from 'notistack'

import yup from '@kathena/libs/yup'
import { ApolloErrorList, Button, TextFormField } from '@kathena/ui'
import { ORG_OFFICE_NAME_REGEX, PHONE_REGEX } from 'utils/validators'

export type OrgOfficeEditorFormInput = {
  name: string
  address: string
  phone: string
}

const error = null

const labels = {
  name: 'Tên chi nhánh',
  address: 'Địa chỉ',
  phone: 'Số điện thoại',
}

const validationSchema = yup.object({
  name: yup
    .string()
    .label(labels.name)
    .trim()
    .matches(ORG_OFFICE_NAME_REGEX, {
      message: `${labels.name} chứa các ký tự không phù hợp`,
    })
    .required(),
  address: yup.string().label(labels.address).trim().required(),
  phone: yup
    .string()
    .label(labels.phone)
    .trim()
    .matches(PHONE_REGEX, {
      message: `${labels.phone} không đúng định dạng`,
    })
    .required(),
})

export type OrgOfficeEditorFormProps = {
  initialValues: OrgOfficeEditorFormInput
  createMode: boolean
}

const OrgOfficeEditorForm: FC<OrgOfficeEditorFormProps> = (props) => {
  const { initialValues, createMode } = props
  const classes = useStyles(props)
  const { enqueueSnackbar } = useSnackbar()

  const handleCreateOrgOfficeEditor = (value: OrgOfficeEditorFormInput) => {
    console.log('Thêm: ')
    console.log(value)
    enqueueSnackbar('Thêm Thành Công', { variant: 'success' })
  }

  const handleUpdateOrgOfficeEditor = (value: OrgOfficeEditorFormInput) => {
    console.log('Sửa: ')
    console.log(value)
    enqueueSnackbar('Sửa Thành Công', { variant: 'success' })
  }

  return (
    <div className={classes.root}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={
          createMode ? handleCreateOrgOfficeEditor : handleUpdateOrgOfficeEditor
        }
      >
        {(formik) => (
          <Form>
            <Grid container spacing={2}>
              <TextFormField
                gridItem={{ xs: 12 }}
                name="name"
                label={labels.name}
              />
              <TextFormField
                gridItem={{ xs: 12 }}
                name="address"
                label={labels.address}
              />
              <TextFormField
                gridItem={{ xs: 12 }}
                name="phone"
                label={labels.phone}
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
                {createMode ? 'Thêm Chi Nhánh' : 'Cập Nhật Chi Nhánh'}
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

export default OrgOfficeEditorForm
