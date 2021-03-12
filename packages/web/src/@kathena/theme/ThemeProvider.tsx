import { FC } from 'react'

import {
  CssBaseline,
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
        {children}
      </MuiThemeProvider>
    </StyledEngineProvider>
  )
}
