import { FC, useCallback, useMemo } from 'react'

import { useSnackbar } from 'notistack'

import { FormDialog } from '@kathena/ui'
import {
  ListOrgOfficesDocument,
  OrgOffice,
  useUpdateOrgOfficeMutation,
  useOrgOfficeQuery,
} from 'graphql/generated'

import {
  FormContent,
  OrgOfficeEditorFormInput,
  validationSchema,
} from './OrgOfficeEditor.form'

export type OrgOfficeWithId = {
  orgOfficeId: string
}

export type OrgOfficeWithOrgOffice = {
  orgOffice: Pick<OrgOffice, 'id' | 'name' | 'address' | 'phone' | 'orgId'>
}

export type UpdateOrgOfficeDialogProps = {
  open: boolean
  onClose: () => void
} & (OrgOfficeWithId | OrgOfficeWithOrgOffice)

const UpdateOrgOfficeDialog: FC<UpdateOrgOfficeDialogProps> = (props) => {
  const { open, onClose } = props
  const { orgOfficeId } = props as OrgOfficeWithId
  const { orgOffice: orgOfficeProp } = props as OrgOfficeWithOrgOffice
  const [updateOrgOffice, { error }] = useUpdateOrgOfficeMutation({
    refetchQueries: [{ query: ListOrgOfficesDocument }],
  })
  const { data } = useOrgOfficeQuery({
    variables: { id: orgOfficeId },
    skip: !!orgOfficeProp,
  })

  const orgOffice = useMemo(
    () => orgOfficeProp || data?.orgOffice,
    [data?.orgOffice, orgOfficeProp],
  )

  const initialValues: OrgOfficeEditorFormInput = useMemo(
    () => orgOffice,
    [orgOffice],
  )

  const { enqueueSnackbar } = useSnackbar()
  const handleUpdateOrgOffice = useCallback(
    async (input: OrgOfficeEditorFormInput) => {
      try {
        const { data: dateUpdated } = await updateOrgOffice({
          variables: {
            id: orgOfficeProp.id,
            input,
          },
        })

        const orgOfficeUpdated = dateUpdated?.updateOrgOffice

        if (!orgOfficeUpdated) {
          return
        }

        enqueueSnackbar(`Sửa văn phòng ${orgOfficeUpdated.name} thành công`, {
          variant: 'success',
        })
        onClose()
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
      }
    },
    [updateOrgOffice, enqueueSnackbar, onClose, orgOfficeProp.id],
  )

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleUpdateOrgOffice}
      dialogTitle="Sửa văn phòng"
      submitButtonLabel="Sửa văn phòng"
      width={400}
    >
      <FormContent error={error} />
    </FormDialog>
  )
}

export default UpdateOrgOfficeDialog
