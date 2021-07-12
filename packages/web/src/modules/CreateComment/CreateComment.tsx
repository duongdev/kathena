import { FC, useCallback } from 'react'

import { Formik } from 'formik'
import { useSnackbar } from 'notistack'

import yup, { SchemaOf } from '@kathena/libs/yup'
import { useAuth } from 'common/auth'
import { useCreateConversationMutation } from 'graphql/generated'

import CreateCommentForm from './CreateComment.form'

export type CreateCommentProps = {
  roomId: string
}

export type CommentFormInput = {
  content: string
}

const labels: { [k in keyof CommentFormInput]: string } = {
  content: 'Nội dung',
}

const validationSchema: SchemaOf<CommentFormInput> = yup.object({
  content: yup.string().label(labels.content).trim().required(),
})

const initialValues = {
  content: '',
}

const CreateComment: FC<CreateCommentProps> = (props) => {
  const { roomId } = props
  const { enqueueSnackbar } = useSnackbar()
  const { $account: account } = useAuth()
  const [createComment] = useCreateConversationMutation()

  const handleSubmitForm = useCallback(
    async (input: CommentFormInput) => {
      try {
        const { data: dataCreated } = await createComment({
          variables: {
            input: {
              content: input.content,
              createdByAccountId: account.id,
              roomId,
            },
          },
        })

        const comment = dataCreated?.createConversation

        if (!comment) {
          return
        }
        enqueueSnackbar(`Bạn vừa bình luận`, { variant: 'success' })

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
      }
    },
    [account.id, roomId, createComment, enqueueSnackbar],
  )

  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={initialValues}
      onSubmit={handleSubmitForm}
    >
      {() => <CreateCommentForm />}
    </Formik>
  )
}

export default CreateComment
