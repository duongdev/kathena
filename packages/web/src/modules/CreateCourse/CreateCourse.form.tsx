import { FC, useMemo } from 'react'

import { CardContent, makeStyles, Stack } from '@material-ui/core'
import AccountAssignerFormField from 'components/AccountAssigner/AccountAssignerFormField'
import { useFormikContext } from 'formik'

import { CurrencyFormField, SelectFormField, TextFormField } from '@kathena/ui'
import { useListOrgOfficesQuery } from 'graphql/generated'

import { CourseFormInput, courseLabels as labels } from './CreateCourse'

export type CreateCourseFormProps = {}

const CreateCourseForm: FC<CreateCourseFormProps> = (props) => {
  const classes = useStyles(props)
  const { data } = useListOrgOfficesQuery()

  const optionOrgOffices: { label: string; value: string }[] = useMemo(() => {
    const options: { label: string; value: string }[] = []
    data?.orgOffices.map((orgOffice) =>
      options.push({
        label: orgOffice.name,
        value: orgOffice.id,
      }),
    )
    return options
  }, [data?.orgOffices])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formik = useFormikContext<CourseFormInput>()

  return (
    <CardContent className={classes.root}>
      <Stack spacing={2}>
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
        <SelectFormField
          gridItem={{ xs: 12 }}
          fullWidth
          required
          name="orgOfficeId"
          label={labels.orgOfficeId}
          placeholder="Chọn chi nhánh"
          options={optionOrgOffices}
        />
        <TextFormField
          type="date"
          required
          name="startDate"
          label={labels.startDate}
        />
      </Stack>
    </CardContent>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default CreateCourseForm
