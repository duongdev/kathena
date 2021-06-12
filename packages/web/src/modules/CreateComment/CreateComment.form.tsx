import { FC } from 'react'

import { Grid } from '@material-ui/core'
import { useFormikContext } from 'formik'
import { PaperPlaneRight } from 'phosphor-react'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { Button, TextFormField } from '@kathena/ui'

import { CommentFormInput } from './CreateComment'

export type CreateCommentFormProps = {}

const CreateCommentForm: FC<CreateCommentFormProps> = () => {
  const formik = useFormikContext<CommentFormInput>()
  return (
    <Grid
      style={{ display: 'flex', alignItems: 'center' }}
      container
      spacing={DASHBOARD_SPACING}
    >
      <Grid item xs={11}>
        <TextFormField
          fullWidth
          required
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              formik.submitForm()
              setTimeout(() => formik.resetForm(), 500)
            }
          }}
          name="content"
        />
      </Grid>
      <Grid item xs={1} style={{ paddingLeft: 0 }}>
        <Button
          onClick={() => {
            formik.submitForm()
            setTimeout(() => formik.resetForm(), 500)
          }}
          endIcon={<PaperPlaneRight weight="duotone" />}
        >
          Gửi
        </Button>
      </Grid>
    </Grid>
  )
}

export default CreateCommentForm
