import { FC } from 'react'

import {
  CssBaseline,
  makeStyles,
  ThemeProvider as MuiThemeProvider,
} from '@material-ui/core'
import StyledEngineProvider from '@material-ui/core/StyledEngineProvider'

import theme from './theme'

export type ThemeProviderProps = {}

export const ThemeProvider: FC<ThemeProviderProps> = (props) => {
  const { children } = props

  return (
    <StyledEngineProvider injectFirst>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles />
        {children}
      </MuiThemeProvider>
    </StyledEngineProvider>
  )
}

const GlobalStyles = () => {
  useGlobalStyles()
  return null
}

const useGlobalStyles = makeStyles(() => ({
  '@global': {
    body: {
      // transition: transitions.create('background-color', {
      //   duration: transitions.duration.standard,
      //   easing: transitions.easing.easeInOut,
      // }),
    },
  },
}))
