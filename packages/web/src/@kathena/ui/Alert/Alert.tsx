import {
  // eslint-disable-next-line no-restricted-imports
  Alert as MuiAlert,
  AlertProps as MuiAlertProps,
} from '@material-ui/core'

import withComponentHocs from '../hocs/withComponentHocs'

export type AlertProps = MuiAlertProps

/** Displays an alert */
const Alert = MuiAlert

export default withComponentHocs(Alert)
