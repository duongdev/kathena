import { FC, useCallback } from 'react'

import { Formik } from 'formik'
import { useSnackbar } from 'notistack'

import yup, { SchemaOf } from '@kathena/libs/yup'
import { ANY } from '@kathena/types'
import { Button, renderApolloError } from '@kathena/ui'
import { useAddAttachmentsToClassworkAssignmentMutation } from 'graphql/generated'

import AddAttachmentsForm from './AddAttachmentsForm'

export type AddAttachmentsToClassworkAssignmentProps = {
  idClassworkAssignment: string
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

const AddAttachmentsToClassworkAssignment: FC<AddAttachmentsToClassworkAssignmentProps> =
  (props) => {
    const { idClassworkAssignment } = props
    const { enqueueSnackbar } = useSnackbar()
    const [addAttachmentsToClassworkAssignment] =
      useAddAttachmentsToClassworkAssignmentMutation({
        context: { hasFileUpload: true },
      })

    const handleSubmitForm = useCallback(
      async (input: AddAttachmentsFormInput) => {
        try {
          if (input.attachments?.length === 0) {
            enqueueSnackbar(`Vui lòng chọn file cần thêm`, { variant: 'error' })
            return
          }
          const dataCreated = (
            await addAttachmentsToClassworkAssignment({
              variables: {
                classworkAssignmentId: idClassworkAssignment,
                attachmentsInput: { attachments: input.attachments as ANY },
              },
            })
          ).data

          const classworkAssignment =
            dataCreated?.addAttachmentsToClassworkAssignment

          if (!classworkAssignment) {
            return
          }
          enqueueSnackbar(`Thêm file vào bài tập thành công`, {
            variant: 'success',
          })
          props.setOpen(false)
          // eslint-disable-next-line no-console
          console.log(classworkAssignment)
        } catch (error) {
          const errorMessage = renderApolloError(error)()
          enqueueSnackbar(errorMessage, { variant: 'error' })
          // eslint-disable-next-line no-console
          console.error(error)
        }
      },
      [
        addAttachmentsToClassworkAssignment,
        enqueueSnackbar,
        idClassworkAssignment,
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

export default AddAttachmentsToClassworkAssignment
