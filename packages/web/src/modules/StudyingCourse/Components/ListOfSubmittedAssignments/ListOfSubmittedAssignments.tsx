import { FC } from 'react'

import { makeStyles } from '@material-ui/core'

export type ListOfSubmittedAssignmentsProps = {}

const ListOfSubmittedAssignments: FC<ListOfSubmittedAssignmentsProps> = (
  props,
) => {
  const classes = useStyles(props)

  return <div className={classes.root}>ListOfSubmittedAssignments</div>
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default ListOfSubmittedAssignments
