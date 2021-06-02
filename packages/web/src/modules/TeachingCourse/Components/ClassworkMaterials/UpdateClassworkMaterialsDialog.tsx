import { FC, useCallback, useMemo } from 'react'

import { useSnackbar } from 'notistack'

import { ANY } from '@kathena/types'
import { FormDialog } from '@kathena/ui'
import {
  useUpdateClassworkMaterialMutation,
  useDetailClassworkMaterialQuery,
  ClassworkMaterial,
} from 'graphql/generated'

import {
  FormContent,
  UpdateClassworkMaterialsFormInput,
  validationSchema,
} from './UpdateClassworkMaterials.from'

export type ClassworkMaterialWithId = {
  classworkMaterialId: string
}

export type ClassworkMaterialWithClassworkMaterial = {
  classworkMaterial: Pick<ClassworkMaterial, 'id' | 'title' | 'description'>
}

export type UpdateClassworkMaterialDialogProps = {
  open: boolean
  onClose: () => void
} & (ClassworkMaterialWithId | ClassworkMaterialWithClassworkMaterial)

const UpdateClassworkMaterialDialog: FC<UpdateClassworkMaterialDialogProps> = (
  props,
) => {
  const { open, onClose } = props
  const { classworkMaterialId } = props as ClassworkMaterialWithId
  const { classworkMaterial: classworkMaterialProp } =
    props as ClassworkMaterialWithClassworkMaterial

  const [updateClassworkMaterial, { error }] =
    useUpdateClassworkMaterialMutation()
  const { data } = useDetailClassworkMaterialQuery({
    variables: { Id: classworkMaterialId },
    skip: !!classworkMaterialProp,
  })

  const classworkMaterial = useMemo(
    () => classworkMaterialProp || data?.classworkMaterial,
    [data?.classworkMaterial, classworkMaterialProp],
  )
  const { enqueueSnackbar } = useSnackbar()

  const initialValues: ANY = useMemo(
    () => classworkMaterial,
    [classworkMaterial],
  )

  const handleUpdateClassworkAssignment = useCallback(
    async (input: UpdateClassworkMaterialsFormInput) => {
      try {
        const { data: dataUpdated } = await updateClassworkMaterial({
          variables: {
            classworkMaterialId: classworkMaterial.id,
            updateClassworkMaterialInput: {
              title: input.title,
              description: input.description,
            },
          },
        })
        const classworkMaterialUpdated = dataUpdated?.updateClassworkMaterial
        // console.log(classworkMaterialProp.id)
        if (!classworkMaterialUpdated) {
          return
        }

        enqueueSnackbar(`Sửa tài liệu thành công`, {
          variant: 'success',
        })
        onClose()
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
      }
    },
    [updateClassworkMaterial, enqueueSnackbar, onClose, classworkMaterial.id],
  )

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleUpdateClassworkAssignment}
      dialogTitle="Sửa tài liệu"
      submitButtonLabel="Sửa"
    >
      <FormContent error={error} />
    </FormDialog>
  )
}

export default UpdateClassworkMaterialDialog
