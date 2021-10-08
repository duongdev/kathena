import { FC } from 'react'
import * as React from 'react'

import { makeStyles, Rating, Box } from '@material-ui/core'
import { Star } from 'phosphor-react'

export type RatingLessonProps = {}

const labels: { [index: string]: string } = {
  0.5: 'Useless',
  1: 'Useless+',
  1.5: 'Poor',
  2: 'Poor+',
  2.5: 'Ok',
  3: 'Ok+',
  3.5: 'Good',
  4: 'Good+',
  4.5: 'Excellent',
  5: 'Excellent+',
}
const RatingLesson: FC<RatingLessonProps> = (props) => {
  const classes = useStyles(props)
  const [value, setValue] = React.useState<number | null>(3)
  const [hover, setHover] = React.useState(-1)

  return (
    <Box
      sx={{
        width: 200,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Rating
        name="hover-feedback"
        value={value}
        precision={0.5}
        onChange={(event, newValue) => {
          setValue(newValue)
        }}
        onChangeActive={(event, newHover) => {
          setHover(newHover)
        }}
        emptyIcon={<Star style={{ opacity: 0.55 }} fontSize="inherit" />}
      />
      {value !== null && (
        <Box sx={{ ml: 2 }}>{labels[hover !== -1 ? hover : value]}</Box>
      )}
    </Box>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default RatingLesson
