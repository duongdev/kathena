import { FC, useCallback } from 'react'

import { CardContent, makeStyles } from '@material-ui/core'
import AccountAssignerFormField from 'components/AccountAssigner/AccountAssignerFormField'
import { Formik } from 'formik'

import yup from '@kathena/libs/yup'
import { SectionCard, Button } from '@kathena/ui'

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
  const classes = useStyles(props)
  // const formik = useFormikContext<LecturerFormInput>()

  const handleClickAndClose = useCallback(() => {
    onClose?.()
  }, [onClose])

  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={initialValues}
      onSubmit={handleClickAndClose}
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
