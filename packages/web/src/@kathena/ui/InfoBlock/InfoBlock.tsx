import { ReactNode } from 'react'

import { makeStyles } from '@material-ui/core'

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
    <div className={classes.root}>
      <InputFieldLabel color={color}>{label}</InputFieldLabel>
      {typeof children === 'string' ? (
        <Typography variant="body1">{children}</Typography>
      ) : (
        children
      )}
    </div>
  )
}

const useStyles = makeStyles({
  root: {
    margin: '10px 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
})

export default withComponentHocs(InfoBlock)
