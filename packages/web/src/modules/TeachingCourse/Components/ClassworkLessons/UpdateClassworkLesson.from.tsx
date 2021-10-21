import { FC, useState } from 'react'

import { ApolloError } from '@apollo/client'
import {
  Grid,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Stack,
} from '@material-ui/core'

import yup, { SchemaOf } from '@kathena/libs/yup'
import { ANY } from '@kathena/types'
import { ApolloErrorList, TextFormField } from '@kathena/ui'
import { UpdateLessonTimeOptions } from 'graphql/generated'

export type UpdateClassworkLessonFormInput = {
  description: string
  startTime: string
  endTime: string
  startDay: string
  endDay: string
  numberOfLessonsPostponed: string
}

export const labels: Record<keyof UpdateClassworkLessonFormInput, string> = {
  description: 'Tiêu đề',
  startTime: 'Thời gian bắt đầu',
  endTime: 'Thời gian kết thúc',
  startDay: 'Ngày bắt đầu',
  endDay: 'Ngày kết thúc',
  numberOfLessonsPostponed: 'Số buổi muốn dời',
}

export const validationSchema: SchemaOf<UpdateClassworkLessonFormInput> =
  yup.object({
    description: yup.string().label(labels.description).required(),
    numberOfLessonsPostponed: yup
      .string()
      .label(labels.numberOfLessonsPostponed)
      .required(),
    startTime: yup.string().label(labels.startTime).trim().required(),
    endTime: yup.string().label(labels.endTime).trim().required(),
    startDay: yup.string().label(labels.startDay).trim().required(),
    endDay: yup.string().label(labels.endDay).trim().required(),
  })

export const FormContent: FC<{ error?: ApolloError }> = ({ error }) => {
  const classes = useStyles()
  const [numberOfLessonsPostponed] = useState({
    numberValue: 0,
  })
  const [statusSubmit, setStatusSubmit] = useState({
    label: 'Thay đổi thời gian buổi học',
    value: UpdateLessonTimeOptions.DoNotChangeTheOrderOfTheLessons,
  })
  const handleSelectTimeOption = (
    event: React.ChangeEvent<{ value: unknown }>,
  ) => {
    // Cập nhật lại state hiển thị
    setStatusSubmit({
      ...statusSubmit,
      value: event.target.value as ANY,
    })
  }
  const arrayOptionStatus = [
    {
      id: 1,
      label: 'Thay đổi thời gian buổi học',
      value: UpdateLessonTimeOptions.DoNotChangeTheOrderOfTheLessons,
    },
    {
      id: 2,
      label: 'Dời buổi học',
      value: UpdateLessonTimeOptions.ArbitraryChange,
    },
  ]
  return (
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
        <InputLabel>Lựa chọn:</InputLabel>
        <Select
          className={classes.selectStatus}
          value={statusSubmit.value}
          onChange={handleSelectTimeOption}
        >
          {arrayOptionStatus?.map((OptionStatus) => (
            <MenuItem key={OptionStatus.id} value={OptionStatus.value}>
              {OptionStatus.label ?? OptionStatus.value}
            </MenuItem>
          ))}
        </Select>
      </Grid>
      {statusSubmit.value === UpdateLessonTimeOptions.ArbitraryChange ? (
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
const useStyles = makeStyles(({ palette }) => ({
  root: {
    width: '8em',
  },
  selectStatus: {
    color: 'black',
    width: '100%',
    height: '2.75em',
    backgroundColor: '#f4f4f4',
  },
  labelSearch: {
    color: palette.background.paper,
    marginRight: '1em',
  },
  headerSearch: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '-0.25em 0em',
    alignItems: 'center',
  },
}))
