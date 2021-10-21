import { FC, useCallback, useMemo } from 'react'

import { useSnackbar } from 'notistack'

import { ANY } from '@kathena/types'
import { FormDialog } from '@kathena/ui'
import {
  ClassworkAssignmentDetailDocument,
  useUpdateClassworkAssignmentMutation,
  useClassworkAssignmentDetailQuery,
  ClassworkAssignment,
} from 'graphql/generated'

import {
  FormContent,
  UpdateClassworkAssignmentFormInput,
  validationSchema,
} from './UpdateClassworkAssignment.form'

export type ClassworkAssignmentWithId = {
  classworkAssignmentId: string
}

export type ClassworkAssignmentWithClassworkAssignment = {
  classworkAssignment: Pick<
    ClassworkAssignment,
    'id' | 'title' | 'description' | 'dueDate'
  >
}

export type UpdateClassworkAssignmentDialogProps = {
  open: boolean
  onClose: () => void
} & (ClassworkAssignmentWithId | ClassworkAssignmentWithClassworkAssignment)

const UpdateClassworkAssignmentDialog: FC<UpdateClassworkAssignmentDialogProps> =
  (props) => {
    const { open, onClose } = props
    const { classworkAssignmentId } = props as ClassworkAssignmentWithId
    const { classworkAssignment: classworkAssignmentProp } =
      props as ClassworkAssignmentWithClassworkAssignment
    const { data } = useClassworkAssignmentDetailQuery({
      variables: { id: classworkAssignmentId },
      skip: !!classworkAssignmentProp,
    })
    const classworkAssignment = useMemo(
      () => classworkAssignmentProp || data?.classworkAssignment,
      [data?.classworkAssignment, classworkAssignmentProp],
    )
    const [updateClassworkAssignment, { error }] =
      useUpdateClassworkAssignmentMutation({
        refetchQueries: [
          {
            query: ClassworkAssignmentDetailDocument,
            variables: { id: classworkAssignment.id },
          },
        ],
      })
    const initialValues: ANY = useMemo(
      () => classworkAssignment,
      [classworkAssignment],
    )

    const { enqueueSnackbar } = useSnackbar()
    const handleUpdateClassworkAssignment = useCallback(
      async (input: UpdateClassworkAssignmentFormInput) => {
        try {
          const { data: dateUpdated } = await updateClassworkAssignment({
            variables: {
              id: classworkAssignment.id,
              input,
            },
          })

          const classworkAssignmentUpdated =
            dateUpdated?.updateClassworkAssignment

          if (!classworkAssignmentUpdated) {
            return
          }

          enqueueSnackbar(`Sửa bài tập thành công`, {
            variant: 'success',
          })
          onClose()
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(err)
        }
      },
      [
        updateClassworkAssignment,
        enqueueSnackbar,
        onClose,
        classworkAssignment.id,
      ],
    )

    return (
      <FormDialog
        open={open}
        onClose={onClose}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleUpdateClassworkAssignment}
        dialogTitle="Sửa bài tập"
        submitButtonLabel="Sửa bài tập"
        backgroundButton="primary"
      >
        <FormContent error={error} />
      </FormDialog>
    )
  }

export default UpdateClassworkAssignmentDialog
