import { FC } from 'react'

import { makeStyles } from '@material-ui/core'

export type DetailClassworkMaterialsProps = {}

const DetailClassworkMaterials: FC<DetailClassworkMaterialsProps> = (props) => {
  const classes = useStyles(props)

  return <div className={classes.root}>DetailClassworkMaterials</div>
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default DetailClassworkMaterials
