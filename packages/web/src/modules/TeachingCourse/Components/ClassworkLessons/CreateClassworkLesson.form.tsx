import { FC } from 'react'

import { CardContent, Grid, makeStyles } from '@material-ui/core'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { SectionCard, TextFormField } from '@kathena/ui'

import { classworkLessonLabels as labels } from './CreateClassworkLesson'

export type CreateClassworkLessonFormProps = {}

const CreateClassworkLessonForm: FC<CreateClassworkLessonFormProps> = (
  props,
) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const classes = useStyles(props)

  return (
    <Grid container spacing={DASHBOARD_SPACING}>
      <SectionCard
        maxContentHeight={false}
        gridItem={{ xs: 12, sm: 12 }}
        title="Thông tin buổi học"
      >
        <CardContent>
          <Grid container spacing={2}>
            <Grid item container xs={12}>
              <TextFormField
                required
                autoFocus
                name="description"
                label={labels.description}
              />
            </Grid>
          </Grid>
          <Grid container mt={0.5}>
            <Grid item container xs={12} spacing={2}>
              <Grid item xs={6}>
                <TextFormField
                  type="date"
                  required
                  name="startDay"
                  label={labels.startDay}
                />
              </Grid>
              <Grid item xs={6}>
                <TextFormField
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
                  type="date"
                  required
                  name="endDay"
                  label={labels.endDay}
                />
              </Grid>
              <Grid item xs={6}>
                <TextFormField
                  type="time"
                  required
                  name="endTime"
                  label={labels.endTime}
                />
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </SectionCard>
    </Grid>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))
export default CreateClassworkLessonForm
