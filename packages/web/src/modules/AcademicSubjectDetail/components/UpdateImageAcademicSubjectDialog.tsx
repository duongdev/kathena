import { FC, useCallback } from 'react'

import { useSnackbar } from 'notistack'

import yup, { SchemaOf } from '@kathena/libs/yup'
import { ANY } from '@kathena/types'
import { FormDialog } from '@kathena/ui'
import { useUpdateFileMutation, ImageFileDocument } from 'graphql/generated'

import {
  UpdateImageAcademicSubjectFormInput,
  UpdateImageForm,
} from './UpdateImage.form'

export type UpdateImageAcademicSubjectDialogProps = {
  imageId: string
  open: boolean
  onClose: () => void
}

const labels: Record<keyof UpdateImageAcademicSubjectFormInput, string> = {
  newFile: 'Hình ảnh',
}

const validationSchema: SchemaOf<UpdateImageAcademicSubjectFormInput> = yup.object(
  {
    newFile: yup.mixed().label(labels.newFile).required() as ANY,
  },
)

const initialValues: UpdateImageAcademicSubjectFormInput = {
  newFile: null,
}

const UpdateImageAcademicSubjectDialog: FC<UpdateImageAcademicSubjectDialogProps> = (
  props,
) => {
  const { open, onClose, imageId } = props
  const [updateFile] = useUpdateFileMutation({
    refetchQueries: [
      {
        query: ImageFileDocument,
        variables: {
          id: imageId,
        },
      },
    ],
  })
  const { enqueueSnackbar } = useSnackbar()

  const handleUpdateImage = useCallback(
    async (input: UpdateImageAcademicSubjectFormInput) => {
      try {
        const { newFile } = input

        const { data } = await updateFile({
          variables: { id: imageId, newFile },
        })

        const image = data?.updateFile

        if (!image) {
          return
        }

        enqueueSnackbar(`Sửa hình ảnh thành công`, {
          variant: 'success',
        })
        onClose()
      } catch (err) {
        enqueueSnackbar(`${err.message}`, {
          variant: 'error',
        })
        // eslint-disable-next-line no-console
        console.error(err)
      }
    },
    [updateFile, enqueueSnackbar, onClose, imageId],
  )

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      dialogTitle="Sửa hình ảnh môn học"
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleUpdateImage}
      submitButtonLabel="Sửa hình ảnh"
      width={400}
    >
      <UpdateImageForm />
    </FormDialog>
  )
}

export default UpdateImageAcademicSubjectDialog
