import React, { Suspense } from 'react'

import { Helmet, HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router-dom'

import Spinner from '../src/@kathena/ui/Spinner'
import { ThemeProvider } from '../src/@kathena/theme'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
}

export const decorators = [
  (Story) => (
    <Suspense fallback={<Spinner />}>
      <BrowserRouter>
        <HelmetProvider>
          <Helmet>
            {/* <link rel="stylesheet" href="/fonts/fonts.css" /> */}
            <link
              href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&display=swap"
              rel="stylesheet"
            />
          </Helmet>
          <ThemeProvider>
            <Story />
          </ThemeProvider>
        </HelmetProvider>
      </BrowserRouter>
    </Suspense>
  ),
]
