import { FC } from 'react'

import { makeStyles } from '@material-ui/core'

export type UpdateCourseProps = {}

const UpdateCourse: FC<UpdateCourseProps> = (props) => {
  const classes = useStyles(props)

  return <div className={classes.root}>UpdateCourse</div>
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default UpdateCourse
