import { FC, useCallback } from 'react'

import { makeStyles } from '@material-ui/core'
import { Formik } from 'formik'
import { useSnackbar } from 'notistack'

import yup, { SchemaOf } from '@kathena/libs/yup'
import { ANY } from '@kathena/types'
import { renderApolloError } from '@kathena/ui'
import { useAuth } from 'common/auth'
import { useCreateCommentMutation } from 'graphql/generated'

import CreateCommentForm from './CreateComment.form'

export type CreateCommentProps = {
  targetId: string
  onSuccess?: (comment: ANY) => void
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
  const { targetId } = props
  const classes = useStyles(props)
  const { enqueueSnackbar } = useSnackbar()
  const { $account: account } = useAuth()
  const [createComment] = useCreateCommentMutation()

  const handleSubmitForm = useCallback(
    async (input: CommentFormInput) => {
      try {
        const { data: dataCreated } = await createComment({
          variables: {
            input: {
              content: input.content,
              createdByAccountId: account.id,
              targetId,
            },
          },
        })

        const comment = dataCreated?.createComment

        if (!comment) {
          return
        }
        enqueueSnackbar(`Bạn vừa bình luận`, { variant: 'success' })
        // eslint-disable-next-line no-console
      } catch (error) {
        const errorMessage = renderApolloError(error)()
        enqueueSnackbar(errorMessage, { variant: 'error' })
        // eslint-disable-next-line no-console
        console.error(error)
      }
    },
    [account.id, targetId, createComment, enqueueSnackbar],
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

const useStyles = makeStyles(() => ({
  root: {},
}))

export default CreateComment
