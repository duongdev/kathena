import { red } from '@material-ui/core/colors'
import { createMuiTheme } from '@material-ui/core/styles'

import {
  PRIMARY_COLOR,
  SECONDARY_COLOR,
  BORDER_RADIUS,
  TEXT_FONT,
  HEADING_FONT,
} from './theme.constants'

// Create a theme instance.
const theme = createMuiTheme({
  palette: {
    primary: {
      main: PRIMARY_COLOR,
    },
    secondary: {
      main: SECONDARY_COLOR,
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#fff',
    },
  },
  shape: {
    borderRadius: BORDER_RADIUS,
  },
  typography: {
    fontSize: 16,
    // htmlFontSize: 18,
    allVariants: {
      fontFamily: TEXT_FONT,
    },
    h1: {
      fontFamily: HEADING_FONT,
      fontWeight: 700,
      fontSize: '3.3125rem', // 53
      lineHeight: 1.2,
    },
    h2: {
      fontFamily: HEADING_FONT,
      fontWeight: 700,
      fontSize: '2.4375rem', // 39
      lineHeight: 1.2,
    },
    h3: {
      fontFamily: HEADING_FONT,
      fontWeight: 700,
      fontSize: '1.9375rem', // 31
      lineHeight: 1.21,
    },
    h4: {
      fontFamily: HEADING_FONT,
      fontWeight: 700,
      fontSize: '1.5625rem', // 25
      lineHeight: 1.218,
    },
  },
  shadows: [
    'none',
    '0px 0px 20px rgba(0, 0, 0, 0.1)',
    '0px 3px 20px rgba(0, 0, 0, 0.1)',
    '0px 3px 20px rgba(0, 0, 0, 0.15)',
    '0px 3px 20px rgba(0, 0, 0, 0.2)',
    '0px 20px 30px rgba(0, 0, 0, 0.4)',
    '0px 21px 31px rgba(0, 0, 0, 0.4)',
    '0px 22px 32px rgba(0, 0, 0, 0.4)',
    '0px 23px 33px rgba(0, 0, 0, 0.4)',
    '0px 24px 34px rgba(0, 0, 0, 0.4)',
    '0px 25px 35px rgba(0, 0, 0, 0.4)',
    '0px 25px 35px rgba(0, 0, 0, 0.4)',
    '0px 25px 35px rgba(0, 0, 0, 0.4)',
    '0px 25px 35px rgba(0, 0, 0, 0.4)',
    '0px 25px 35px rgba(0, 0, 0, 0.4)',
    '0px 25px 35px rgba(0, 0, 0, 0.4)',
    '0px 25px 35px rgba(0, 0, 0, 0.4)',
    '0px 25px 35px rgba(0, 0, 0, 0.4)',
    '0px 25px 35px rgba(0, 0, 0, 0.4)',
    '0px 25px 35px rgba(0, 0, 0, 0.4)',
    '0px 25px 35px rgba(0, 0, 0, 0.4)',
    '0px 25px 35px rgba(0, 0, 0, 0.4)',
    '0px 25px 35px rgba(0, 0, 0, 0.4)',
    '0px 25px 35px rgba(0, 0, 0, 0.4)',
    '0px 25px 35px rgba(0, 0, 0, 0.4)',
  ],
  components: {
    MuiButtonBase: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiCircularProgress: {
      defaultProps: {
        disableShrink: false,
      },
    },
  },
})

export default theme
