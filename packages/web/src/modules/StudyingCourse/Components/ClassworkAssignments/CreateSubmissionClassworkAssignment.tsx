import { FC } from 'react'

import { makeStyles } from '@material-ui/core'

export type CreateSubmissionClassworkAssignmentProps = {}

const CreateSubmissionClassworkAssignment: FC<CreateSubmissionClassworkAssignmentProps> =
  (props) => {
    const classes = useStyles(props)

    return (
      <div className={classes.root}>CreateSubmissionClassworkAssignment</div>
    )
  }

const useStyles = makeStyles(() => ({
  root: {},
}))

export default CreateSubmissionClassworkAssignment
