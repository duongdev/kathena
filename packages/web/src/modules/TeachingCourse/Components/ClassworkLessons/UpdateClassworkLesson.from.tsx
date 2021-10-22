import { FC, useState } from 'react'

import { ApolloError } from '@apollo/client'
import { Grid, makeStyles, Stack } from '@material-ui/core'
import { useFormikContext } from 'formik'

import yup, { SchemaOf } from '@kathena/libs/yup'
import { ANY } from '@kathena/types'
import { ApolloErrorList, SelectFormField, TextFormField } from '@kathena/ui'
import { UpdateLessonTimeOptions } from 'graphql/generated'

export type UpdateClassworkLessonFormInput = {
  description: string
  startTime: string | ANY
  endTime: string | ANY
  startDay: string | ANY
  endDay: string | ANY
  numberOfLessonsPostponed: number
  options: string
}

export const labels: Record<keyof UpdateClassworkLessonFormInput, string> = {
  description: 'Tiêu đề',
  startTime: 'Thời gian bắt đầu',
  endTime: 'Thời gian kết thúc',
  startDay: 'Ngày bắt đầu',
  endDay: 'Ngày kết thúc',
  numberOfLessonsPostponed: 'Số buổi muốn dời',
  options: 'Lựa chọn',
}

export const validationSchema: SchemaOf<UpdateClassworkLessonFormInput> =
  yup.object({
    description: yup.string().label(labels.description).required(),
    options: yup.string().label(labels.options).required(),
    numberOfLessonsPostponed: yup
      .number()
      .label(labels.numberOfLessonsPostponed)
      .required(),
    // startTime: yup.string().label(labels.startTime).trim().notRequired(),
    // endTime: yup.string().label(labels.endTime).trim().notRequired(),
    // startDay: yup.string().label(labels.startDay).trim().notRequired(),
    // endDay: yup.string().label(labels.endDay).trim().notRequired(),
    startTime: yup.string().when('options', {
      is: true,
      then: yup.string().label(labels.startTime).trim().required(),
      otherwise: yup.string().label(labels.startTime).trim().notRequired(),
    }),
    endTime: yup.string().when('options', {
      is: true,
      then: yup.string().label(labels.endTime).trim().required(),
      otherwise: yup.string().label(labels.endTime).trim().notRequired(),
    }),
    startDay: yup.string().when('options', {
      is: true,
      then: yup.string().label(labels.startDay).trim().required(),
      otherwise: yup.string().label(labels.startDay).trim().notRequired(),
    }),
    endDay: yup.string().when('options', {
      is: true,
      then: yup.string().label(labels.endDay).trim().required(),
      otherwise: yup.string().label(labels.endDay).trim().notRequired(),
    }),
  })

export const FormContent: FC<{ error?: ApolloError }> = ({ error }) => {
  const classes = useStyles()
  const [numberOfLessonsPostponed] = useState({
    numberValue: 0,
  })

  const formik = useFormikContext<UpdateClassworkLessonFormInput>()
  const [statusSubmit, setStatusSubmit] = useState({
    value: UpdateLessonTimeOptions.DoNotChangeTheOrderOfTheLessons as ANY,
  })

  const handleSelectTimeOption = (
    event: React.ChangeEvent<{ value: unknown }>,
  ) => {
    // Cập nhật lại state hiển thị
    formik.setFieldValue('options', event.target.value)
    setStatusSubmit({
      ...statusSubmit,
      value: event.target.value,
    })
  }
  const arrayOptionStatus = [
    {
      id: 1,
      label: 'Dời buổi học',
      value: UpdateLessonTimeOptions.DoNotChangeTheOrderOfTheLessons as string,
    },
    {
      id: 2,
      label: 'Thay đổi thời gian buổi học',
      value: UpdateLessonTimeOptions.ArbitraryChange as string,
    },
  ]
  return (
    <Stack spacing={2} className={classes.root}>
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
        <SelectFormField
          gridItem={{ xs: 12 }}
          fullWidth
          required
          name="options"
          label={labels.options}
          defaultValue={UpdateLessonTimeOptions.DoNotChangeTheOrderOfTheLessons}
          placeholder="Lựa chọn"
          options={arrayOptionStatus}
          onChange={handleSelectTimeOption}
        />
      </Grid>
      {statusSubmit.value ===
      UpdateLessonTimeOptions.DoNotChangeTheOrderOfTheLessons ? (
        <>
          {/* Số buổi muốn dời */}
          <Grid container>
            <TextFormField
              required
              defaultValue={numberOfLessonsPostponed.numberValue}
              name="numberOfLessonsPostponed"
              label={labels.numberOfLessonsPostponed}
              autoFocus
            />
          </Grid>
        </>
      ) : (
        <>
          {/* Thời gian muốn thay đổi buổi học */}

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
        </>
      )}
      {error && <ApolloErrorList error={error} />}
    </Stack>
  )
}
const useStyles = makeStyles(() => ({
  root: {},
}))
