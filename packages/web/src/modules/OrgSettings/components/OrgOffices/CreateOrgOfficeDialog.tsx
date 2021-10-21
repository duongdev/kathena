import { FC, useCallback } from 'react'

import { useSnackbar } from 'notistack'

import { FormDialog } from '@kathena/ui'
import {
  ListOrgOfficesDocument,
  useCreateOrgOfficeMutation,
} from 'graphql/generated'

import {
  FormContent,
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
  const [createOrgOffice, { error }] = useCreateOrgOfficeMutation({
    refetchQueries: [{ query: ListOrgOfficesDocument }],
  })
  const { enqueueSnackbar } = useSnackbar()

  const handleCreateOrgOffice = useCallback(
    async (input: OrgOfficeEditorFormInput) => {
      try {
        const { data } = await createOrgOffice({ variables: { input } })

        const orgOffice = data?.createOrgOffice

        if (!orgOffice) {
          return
        }

        enqueueSnackbar(`Đã tạo văn phòng ${orgOffice.name}`, {
          variant: 'success',
        })
        onClose()
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
      }
    },
    [createOrgOffice, enqueueSnackbar, onClose],
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
      backgroundButton="primary"
    >
      <FormContent error={error} />
    </FormDialog>
  )
}

export default CreateOrgOfficeDialog
