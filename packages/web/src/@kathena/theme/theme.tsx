import { red } from '@material-ui/core/colors'
import { createMuiTheme, ThemeOptions } from '@material-ui/core/styles'

import {
  PRIMARY_COLOR,
  SECONDARY_COLOR,
  BORDER_RADIUS,
  TEXT_FONT,
  HEADING_FONT,
} from './theme.constants'

const shadows: ThemeOptions['shadows'] = [
  'none',
  '0px 0px 20px rgba(0, 0, 0, 0.1)',
  '0px 5px 20px rgba(0, 0, 0, 0.2)',
  '0px 10px 25px rgba(0, 0, 0, 0.3)',
  '0px 15px 30px rgba(0, 0, 0, 0.4)',
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
]

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
      paper: '#FFFFFF',
      default: '#F0F2F8',
      dark: '#f4f4f4',
      grey: '#fafafa',
    },
    semantic: {
      yellow: '#FFAB00',
      green: '#36B37E',
      red: '#FF5630',
      purple: '#6554C0',
      tale: '#00B8D9',
      smoke: '#CECECE',
      blue: '#0065FF',
      pale: '#1582C0',
    },
    divider: '#dee3e6',
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
    button: {
      fontWeight: 700,
      letterSpacing: '0.05rem',
    },
  },
  shadows,
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none' },
        contained: {
          boxShadow: shadows[1],
          '&:hover': { boxShadow: shadows[2] },
          '&:active': { boxShadow: shadows[3] },
        },
        sizeSmall: { height: 34 },
        sizeMedium: { height: 40 },
        sizeLarge: { height: 45 },
      },
    },
    MuiCircularProgress: {
      defaultProps: { disableShrink: false },
    },
  },
})

export interface SemanticColor {
  yellow: string
  green: string
  red: string
  purple: string
  tale: string
  smoke: string
  blue: string
  pale: string
}

declare module '@material-ui/core/styles/createPalette' {
  interface PaletteOptions {
    semantic: SemanticColor
  }
  interface Palette {
    semantic: SemanticColor
  }
  interface TypeBackground {
    dark: string
    grey: string
  }
}

export default theme
