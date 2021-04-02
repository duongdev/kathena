import { FC, useCallback } from 'react'

import { FormDialog } from '@kathena/ui'
import { wait } from '@kathena/utils'

import {
  formContent,
  OrgOfficeEditorFormInput,
  validationSchema,
} from './OrgOfficeEditor.form'

export type CreateOrgOfficeDialogProps = {
  open: boolean
  onClose: () => void
}

const initialValues: OrgOfficeEditorFormInput = {
  name: '',
  address: '',
  phone: '',
}

const CreateOrgOfficeDialog: FC<CreateOrgOfficeDialogProps> = (props) => {
  const { open, onClose } = props

  const handleCreateOrgOffice = useCallback(
    async (input: OrgOfficeEditorFormInput) => {
      // eslint-disable-next-line no-console
      console.log(input)
      await wait(2000)
    },
    [],
  )

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleCreateOrgOffice}
      submitButtonLabel="Tạo văn phòng"
      width={400}
    >
      {formContent}
    </FormDialog>
  )
}

export default CreateOrgOfficeDialog
