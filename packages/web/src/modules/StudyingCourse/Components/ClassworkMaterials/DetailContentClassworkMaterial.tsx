import { FC } from 'react'

import { makeStyles } from '@material-ui/core'

export type DetailContentClassworkMaterialProps = {}

const DetailContentClassworkMaterial: FC<DetailContentClassworkMaterialProps> =
  (props) => {
    const classes = useStyles(props)

    return <div className={classes.root}>DetailContentClassworkMaterial</div>
  }

const useStyles = makeStyles(() => ({
  root: {},
}))

export default DetailContentClassworkMaterial
