import { ReactNode } from 'react'

import { Grid, makeStyles } from '@material-ui/core'

import withComponentHocs from '../hocs/withComponentHocs'
import InputFieldLabel, {
  InputFieldLabelProps,
} from '../InputField/InputFieldLabel'
import Typography from '../Typography'

export type InfoBlockProps = {
  label: string
  children: ReactNode
} & InputFieldLabelProps

const InfoBlock = (props: InfoBlockProps) => {
  const { label, children, color } = props
  const classes = useStyles(props)
  return (
    <Grid container className={classes.root}>
      <Grid item xs={4}>
        <InputFieldLabel color={color}>{label}</InputFieldLabel>
      </Grid>
      {typeof children === 'string' ? (
        <Typography gridItem={{ xs: 8 }} variant="body1">
          {children}
        </Typography>
      ) : (
        children
      )}
    </Grid>
  )
}

const useStyles = makeStyles({
  root: {
    margin: '10px 0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  text: {
    textAlign: 'right',
  },
})

export default withComponentHocs(InfoBlock)
