import { FC, useCallback } from 'react'

import { Formik } from 'formik'
import { useSnackbar } from 'notistack'

import yup, { SchemaOf } from '@kathena/libs/yup'
import { ANY } from '@kathena/types'
import { Button, renderApolloError } from '@kathena/ui'
import { useAddAttachmentsToClassworkMaterialMutation } from 'graphql/generated'

import AddAttachmentsForm from './AddAttachmentClassworkMaterialFrom'

export type AddAttachmentsToClassworkMaterialProps = {
  idClassworkMaterial: string
  setOpen: ANY
}

export type AddAttachmentsFormInput = {
  attachments: File[] | null
}

const labels: { [k in keyof AddAttachmentsFormInput]: string } = {
  attachments: 'Tập tin đính kèm',
}

const validationSchema: SchemaOf<AddAttachmentsFormInput> = yup.object({
  attachments: yup.mixed().label(labels.attachments).notRequired() as ANY,
})

const initialValues = {
  attachments: null,
}

const AddAttachmentsToClassworkMaterial: FC<AddAttachmentsToClassworkMaterialProps> =
  (props) => {
    const { idClassworkMaterial } = props
    const { enqueueSnackbar } = useSnackbar()
    const [addAttachmentsToClassworkMaterial] =
      useAddAttachmentsToClassworkMaterialMutation({
        context: { hasFileUpload: true },
      })

    const handleSubmitForm = useCallback(
      async (input: AddAttachmentsFormInput) => {
        try {
          const dataCreated = (
            await addAttachmentsToClassworkMaterial({
              variables: {
                classworkMaterialId: idClassworkMaterial,
                attachmentsInput: { attachments: input.attachments as ANY },
              },
            })
          ).data

          const classworkMaterial =
            dataCreated?.addAttachmentsToClassworkMaterial

          if (!classworkMaterial) {
            return
          }
          enqueueSnackbar(`Thêm file vào tài liệu thành công`, {
            variant: 'success',
          })
          props.setOpen(false)
          // eslint-disable-next-line no-console
          console.log(classworkMaterial)
        } catch (error) {
          const errorMessage = renderApolloError(error)()
          enqueueSnackbar(errorMessage, { variant: 'error' })
          // eslint-disable-next-line no-console
          console.error(error)
        }
      },
      [
        addAttachmentsToClassworkMaterial,
        enqueueSnackbar,
        idClassworkMaterial,
        props,
      ],
    )

    return (
      <Formik
        validationSchema={validationSchema}
        initialValues={initialValues}
        onSubmit={handleSubmitForm}
      >
        {(formik) => (
          <>
            <AddAttachmentsForm />
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Button style={{ width: '100px' }} onClick={formik.submitForm}>
                Thêm file
              </Button>
              <Button
                style={{ width: '100px' }}
                onClick={() => {
                  formik.setFieldValue('attachments', null)
                  props.setOpen(false)
                }}
              >
                Đóng
              </Button>
            </div>
          </>
        )}
      </Formik>
    )
  }

export default AddAttachmentsToClassworkMaterial
