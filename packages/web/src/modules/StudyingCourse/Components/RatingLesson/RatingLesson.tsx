import * as React from 'react'
import { FC, useState } from 'react'

import { Box, Grid, makeStyles, Rating } from '@material-ui/core'
import { useSnackbar } from 'notistack'
import { Star } from 'phosphor-react'

import { Button, Dialog } from '@kathena/ui'
import { Lesson, useCreateRatingForTheLessonMutation } from 'graphql/generated'

export type RatingLessonProps = {
  open: boolean
  onClose: () => void
  lesson: Pick<
    Lesson,
    'description' | 'startTime' | 'endTime' | 'courseId' | 'id'
  >
}

const labels: { [index: string]: string } = {
  1: 'Rất tệ',
  2: 'Tệ',
  3: 'Bình thường',
  4: 'Hài Lòng',
  5: 'Rất hài lòng',
}
const RatingLesson: FC<RatingLessonProps> = (props) => {
  const classes = useStyles(props)
  const { open, onClose, lesson } = props
  const [value, setValue] = React.useState<number | null>(3)

  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const [updateRating] = useCreateRatingForTheLessonMutation()
  const handleRating = async () => {
    if (lesson) {
      setLoading(true)
      const lessonUpdate = await updateRating({
        variables: {
          ratingInput: {
            targetId: lesson.id,
            numberOfStars: value,
          },
        },
      })
      if (lessonUpdate) {
        enqueueSnackbar(`Đánh giá thành công`, { variant: 'success' })
        onClose()
      } else {
        enqueueSnackbar(`Đánh giá thất bại`, { variant: 'error' })
      }
      setLoading(false)
    } else {
      enqueueSnackbar(`Đánh giá thất bại`, { variant: 'error' })
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      width={300}
      dialogTitle="Đánh giá buổi học"
      extraDialogActions={
        <Button onClick={handleRating} loading={loading}>
          Lưu
        </Button>
      }
    >
      <Grid xs={12} container className={classes.root}>
        <Grid item xs={12}>
          {value !== null && (
            <Box sx={{ textAlign: 'center' }}>{labels[value]}</Box>
          )}
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ textAlign: 'center' }}>
            <Rating
              name="hover-feedback"
              size="large"
              value={value}
              precision={1}
              onChange={(event, newValue) => {
                setValue(newValue)
              }}
              emptyIcon={<Star style={{ opacity: 0.55 }} fontSize="inherit" />}
            />
          </Box>
        </Grid>
      </Grid>
    </Dialog>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default RatingLesson
