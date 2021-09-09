import { FC } from 'react'

import { CardContent, Grid, makeStyles, Stack } from '@material-ui/core'

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
        gridItem={{ xs: 12, sm: 6 }}
        title="Thông tin bài tập"
      >
        <CardContent>
          <Stack spacing={2}>
            <TextFormField
              required
              autoFocus
              name="description"
              label={labels.description}
            />
            <TextFormField
              type="date"
              required
              name="startTime"
              label={labels.startTime}
            />
            <TextFormField
              type="date"
              required
              name="endTime"
              label={labels.endTime}
            />
          </Stack>
        </CardContent>
      </SectionCard>
    </Grid>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))
export default CreateClassworkLessonForm
