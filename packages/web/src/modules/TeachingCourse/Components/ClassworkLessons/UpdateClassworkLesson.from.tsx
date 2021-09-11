import { FC } from 'react'

import { ApolloError } from '@apollo/client'
import { Grid, Stack } from '@material-ui/core'

import yup, { SchemaOf } from '@kathena/libs/yup'
import { ApolloErrorList, TextFormField } from '@kathena/ui'

export type UpdateClassworkLessonFormInput = {
  description: string
  startTime: string
  endTime: string
  startDay: string
  endDay: string
}

export const labels: Record<keyof UpdateClassworkLessonFormInput, string> = {
  description: 'Tiêu đề',
  startTime: 'Thời gian bắt đầu',
  endTime: 'Thời gian kết thúc',
  startDay: 'Ngày bắt đầu',
  endDay: 'Ngày kết thúc',
}

export const validationSchema: SchemaOf<UpdateClassworkLessonFormInput> =
  yup.object({
    description: yup.string().label(labels.description).required(),
    startTime: yup.string().label(labels.startTime).trim().required(),
    endTime: yup.string().label(labels.endTime).trim().required(),
    startDay: yup.string().label(labels.startDay).trim().required(),
    endDay: yup.string().label(labels.endDay).trim().required(),
  })

export const FormContent: FC<{ error?: ApolloError }> = ({ error }) => (
  <Stack spacing={2}>
    <Grid container>
      <Grid item container xs={12}>
        <TextFormField
          required
          autoFocus
          label={labels.description}
          name="description"
        />
      </Grid>
    </Grid>
    <Grid container>
      <Grid item container xs={12} spacing={2}>
        <Grid item xs={6}>
          <TextFormField
            type="date"
            required
            name="startDay"
            label={labels.startDay}
            autoFocus
          />
        </Grid>
        <Grid item xs={6}>
          <TextFormField
            autoFocus
            type="time"
            required
            name="startTime"
            label={labels.startTime}
          />
        </Grid>
      </Grid>
    </Grid>
    <Grid container mt={0.5}>
      <Grid item container xs={12} spacing={2}>
        <Grid item xs={6}>
          <TextFormField
            autoFocus
            type="date"
            required
            name="endDay"
            label={labels.endDay}
          />
        </Grid>
        <Grid item xs={6}>
          <TextFormField
            autoFocus
            type="time"
            required
            name="endTime"
            label={labels.endTime}
          />
        </Grid>
      </Grid>
    </Grid>
    {error && <ApolloErrorList error={error} />}
  </Stack>
)
