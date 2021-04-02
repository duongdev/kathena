import { FC } from 'react'

import { makeStyles } from '@material-ui/core'

export type OrgOfficeListProps = {}

const OrgOfficeList: FC<OrgOfficeListProps> = (props) => {
  const classes = useStyles(props)

  return <div className={classes.root}>OrgOfficeList</div>
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default OrgOfficeList
