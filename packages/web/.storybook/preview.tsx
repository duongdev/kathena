import React, { Suspense } from 'react'

import { CssBaseline, ThemeProvider } from '@material-ui/core'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router-dom'

import Spinner from '../src/core/components/Spinner'
import theme from '../src/core/theme'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
}

export const decorators = [
  (Story) => (
    <Suspense fallback={<Spinner />}>
      <BrowserRouter>
        <HelmetProvider>
          <Helmet>
            <link rel="stylesheet" href="/fonts/fonts.css" />
          </Helmet>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Story />
          </ThemeProvider>
        </HelmetProvider>
      </BrowserRouter>
    </Suspense>
  ),
]
