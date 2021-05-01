import { ReactNode } from 'react'

import { Grid, makeStyles, Stack } from '@material-ui/core'

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
    <Stack className={classes.root}>
      <InputFieldLabel color={color}>{label}</InputFieldLabel>
      {typeof children === 'string' ? (
        <Typography variant="body1">{children}</Typography>
      ) : (
        children
      )}
    </Stack>
  )
}

const useStyles = makeStyles({
  root: {},
  text: {},
})

export default withComponentHocs(InfoBlock)
