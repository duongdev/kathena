import { FC } from 'react'

import { makeStyles } from '@material-ui/core'

export type DetailClassworkLessonProps = {}

const DetailClassworkLesson: FC<DetailClassworkLessonProps> = (props) => {
  const classes = useStyles(props)

  return <div className={classes.root}>DetailClassworkLesson</div>
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default DetailClassworkLesson
