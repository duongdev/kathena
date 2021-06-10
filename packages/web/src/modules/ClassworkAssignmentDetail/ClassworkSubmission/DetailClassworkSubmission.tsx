import { FC } from 'react'

import { makeStyles } from '@material-ui/core'

export type DetailClassworkSubmissionProps = {}

const DetailClassworkSubmission: FC<DetailClassworkSubmissionProps> = (
  props,
) => {
  const classes = useStyles(props)

  return <div className={classes.root}>DetailClassworkSubmission</div>
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default DetailClassworkSubmission
