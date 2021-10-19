import { FC, useCallback } from 'react'

import { useSnackbar } from 'notistack'

import { FormDialog } from '@kathena/ui'
import {
  FindClassworkSubmissionByIdDocument,
  useSetGradeForClassworkSubmissionMutation,
} from 'graphql/generated'

import { FormContent, GradeFormInput, validationSchema } from './Grade.form'

export type GradeDialogProps = {
  open: boolean
  submissionId: string
  onClose: () => void
}

const initialValues: GradeFormInput = {
  grade: 0,
}

const GradeDialog: FC<GradeDialogProps> = (props) => {
  const { open, onClose, submissionId } = props
  const [setGradeForClassworkSubmission, { error }] =
    useSetGradeForClassworkSubmissionMutation({
      refetchQueries: [
        {
          query: FindClassworkSubmissionByIdDocument,
          variables: { classworkSubmissionId: submissionId },
        },
      ],
    })
  const { enqueueSnackbar } = useSnackbar()

  const handleGrade = useCallback(
    async (input: GradeFormInput) => {
      try {
        const { data } = await setGradeForClassworkSubmission({
          variables: {
            setGradeForClassworkSubmissionInput: {
              submissionId,
              grade: input.grade,
            },
          },
        })

        const submission = data?.setGradeForClassworkSubmission

        if (!submission) {
          return
        }

        enqueueSnackbar('Đã chấm điểm thành công', {
          variant: 'success',
        })
        onClose()
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
      }
    },
    [setGradeForClassworkSubmission, submissionId, enqueueSnackbar, onClose],
  )

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleGrade}
      submitButtonLabel="Chấm điểm"
      width={400}
      backgroundButton="primary"
    >
      <FormContent error={error} />
    </FormDialog>
  )
}

export default GradeDialog
