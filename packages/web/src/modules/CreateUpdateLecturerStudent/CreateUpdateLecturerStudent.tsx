import { FC } from 'react'

import { makeStyles } from '@material-ui/core'

export type CreateUpdateLecturerStudentProps = {}

const CreateUpdateLecturerStudent: FC<CreateUpdateLecturerStudentProps> = (
  props,
) => {
  const classes = useStyles(props)

  return <div className={classes.root}>CreateUpdateLecturerStudent</div>
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default CreateUpdateLecturerStudent
