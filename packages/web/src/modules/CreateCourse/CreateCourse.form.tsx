import { FC } from 'react'

import { CardContent, makeStyles, Stack } from '@material-ui/core'
import AccountAssignerFormField from 'components/AccountAssigner/AccountAssignerFormField'
import { useFormikContext } from 'formik'

import { CurrencyFormField, TextFormField } from '@kathena/ui'

import { CourseFormInput, courseLabels as labels } from './CreateCourse'

export type CreateCourseFormProps = {}

const CreateCourseForm: FC<CreateCourseFormProps> = (props) => {
  const classes = useStyles(props)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formik = useFormikContext<CourseFormInput>()

  return (
    <CardContent className={classes.root}>
      <Stack spacing={2}>
        <TextFormField hidden name="academicSubjectId" />
        <TextFormField required autoFocus name="name" label={labels.name} />
        <TextFormField required name="code" label={labels.code} />
        <CurrencyFormField
          required
          name="tuitionFee"
          label={labels.tuitionFee}
        />
        <AccountAssignerFormField
          name="lecturerIds"
          label={labels.lecturerIds}
          roles={['lecturer']}
          multiple
        />
        <TextFormField type="date" name="startDate" label={labels.startDate} />
      </Stack>
    </CardContent>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default CreateCourseForm
