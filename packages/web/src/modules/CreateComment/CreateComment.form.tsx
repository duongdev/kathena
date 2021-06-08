import { FC } from 'react'

import { Grid } from '@material-ui/core'
import { useFormikContext } from 'formik'
import { PaperPlaneRight } from 'phosphor-react'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { EditorFormField, Button } from '@kathena/ui'

import { CommentFormInput } from './CreateComment'

export type CreateCommentFormProps = {}

const CreateCommentForm: FC<CreateCommentFormProps> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formik = useFormikContext<CommentFormInput>()

  return (
    <Grid
      style={{ display: 'flex', alignItems: 'center' }}
      container
      spacing={DASHBOARD_SPACING}
    >
      <Grid item xs={11}>
        <EditorFormField
          fullWidth
          modulesType="simple"
          required
          name="content"
        />
      </Grid>
      <Button
        onClick={formik.submitForm}
        gridItem={{ xs: 1 }}
        endIcon={<PaperPlaneRight weight="duotone" />}
      >
        Gửi
      </Button>
    </Grid>
  )
}

export default CreateCommentForm
