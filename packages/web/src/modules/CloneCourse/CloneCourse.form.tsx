import { FC, useMemo, useState } from 'react'

import { CardContent, Checkbox, makeStyles, Stack } from '@material-ui/core'
import AccountAssignerFormField from 'components/AccountAssigner/AccountAssignerFormField'
import { useFormikContext } from 'formik'

import { ANY } from '@kathena/types'
import { CurrencyFormField, SelectFormField, TextFormField } from '@kathena/ui'
import InputFieldLabel from '@kathena/ui/InputField/InputFieldLabel'
import { DayOfWeek, useListOrgOfficesQuery } from 'graphql/generated'

import { CourseFormInput, courseLabels as labels } from './CloneCourse'

export type CreateCourseFormProps = {}

const dayOfTheWeekData = [
  DayOfWeek.Monday,
  DayOfWeek.Tuesday,
  DayOfWeek.Wednesday,
  DayOfWeek.Thursday,
  DayOfWeek.Friday,
  DayOfWeek.Saturday,
  DayOfWeek.Sunday,
]

const CreateCourseForm: FC<CreateCourseFormProps> = (props) => {
  const classes = useStyles(props)
  const [daysOfTheWeek, setDaysOfTheWeek] = useState<ANY[]>([])
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

  const onChangeDay = (day: DayOfWeek) => {
    const arr = [...daysOfTheWeek]
    const index = arr.findIndex((i) => i.dayOfWeek === day)
    if (index > -1) {
      arr.splice(index, 1)
    } else {
      arr.push({
        dayOfWeek: day,
        startTime: '00:00',
        endTime: '23:59',
      })
    }
    setDaysOfTheWeek(arr)
    formik.setFieldValue('daysOfTheWeek', arr)
  }

  const onChangeStartTime = (day: DayOfWeek, value: string) => {
    const arr = [...daysOfTheWeek]
    const index = arr.findIndex((i) => i.dayOfWeek === day)
    if (index > -1) {
      const hStart = value.split(':')[0]
      const mStart = value.split(':')[1]
      const hEnd = arr[index].endTime.split(':')[0]
      const mEnd = arr[index].endTime.split(':')[1]
      if (
        Number(hStart) < Number(hEnd) ||
        (Number(hStart) === Number(hEnd) && Number(mStart) <= Number(mEnd))
      ) {
        arr[index].startTime = value
        setDaysOfTheWeek(arr)
        formik.setFieldValue('daysOfTheWeek', arr)
      } else {
        arr[index].startTime = value
        arr[index].endTime = value
        setDaysOfTheWeek(arr)
        formik.setFieldValue('daysOfTheWeek', arr)
      }
    }
  }

  const onChangeEndTime = (day: DayOfWeek, value: string) => {
    const arr = [...daysOfTheWeek]
    const index = arr.findIndex((i) => i.dayOfWeek === day)
    if (index > -1) {
      const hEnd = value.split(':')[0]
      const mEnd = value.split(':')[1]
      const hStart = arr[index].startTime.split(':')[0]
      const mStart = arr[index].startTime.split(':')[1]
      if (
        Number(hEnd) < Number(hStart) ||
        (Number(hEnd) === Number(hStart) && Number(mEnd) < Number(mStart))
      ) {
        arr[index].startTime = value
        arr[index].endTime = value
        setDaysOfTheWeek(arr)
        formik.setFieldValue('daysOfTheWeek', arr)
      } else {
        arr[index].endTime = value
        setDaysOfTheWeek(arr)
        formik.setFieldValue('daysOfTheWeek', arr)
      }
    }
  }

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
        <div className={classes.inputDayofWeekContainer}>
          <InputFieldLabel required>{labels.daysOfTheWeek}</InputFieldLabel>
          <div className={classes.inputDayofWeekWrapper}>
            {dayOfTheWeekData.map((item) => {
              const arr = [...daysOfTheWeek]
              const index = arr.findIndex((i) => i.dayOfWeek === item)
              const active = index > -1
              return (
                <div className={classes.dayOfWeek}>
                  <Checkbox
                    checked={active}
                    onChange={() => onChangeDay(item)}
                  />
                  {item}:{' '}
                  <input
                    style={
                      active ? { margin: '0 10px' } : { marginLeft: '10px' }
                    }
                    disabled={!active}
                    value={active ? daysOfTheWeek[index].startTime : '00:00'}
                    onChange={(e) => onChangeStartTime(item, e.target.value)}
                    className={classes.input}
                    type="time"
                  />{' '}
                  {`->`}{' '}
                  <input
                    style={active ? { margin: '0 10px' } : { marginLeft: 20 }}
                    disabled={!active}
                    value={active ? daysOfTheWeek[index].endTime : '23:59'}
                    className={classes.input}
                    onChange={(e) => onChangeEndTime(item, e.target.value)}
                    type="time"
                  />
                </div>
              )
            })}
          </div>
        </div>
      </Stack>
    </CardContent>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
  inputDayofWeekContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputDayofWeekWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  dayOfWeek: {
    padding: '10px 20px',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    borderRadius: '6px',
    border: 'none',
    background: '#fff',
    '&:focus': {
      borderRadius: '6px',
      border: 'none',
      background: '#fff',
    },
  },
}))

export default CreateCourseForm
