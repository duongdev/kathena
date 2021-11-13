import { lazy, Suspense } from 'react'

import { SnackbarProvider } from 'notistack'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { BrowserRouter as Router } from 'react-router-dom'

import { setLocale } from '@kathena/libs/yup'
import yupViLocale from '@kathena/libs/yupViLocale'
import { ThemeProvider } from '@kathena/theme'
import { Spinner } from '@kathena/ui'
import { ApolloProvider } from 'common/apollo'
import { AuthProvider } from 'common/auth'

import './App.css'
import AppRoute from './App.route'

const AutoScrollToTop = lazy(() => import('@kathena/ui/AutoScrollToTop'))

setLocale(yupViLocale)

function App() {
  return (
    <Suspense fallback={<Spinner container="fullscreen" />}>
      <ApolloProvider>
        <AuthProvider>
          <ThemeProvider>
            <SnackbarProvider maxSnack={3}>
              <HelmetProvider>
                <Helmet
                  defaultTitle="Kathena Platform"
                  titleTemplate="%s | Kathena Platform"
                />
                <Router>
                  <AutoScrollToTop />
                  <AppRoute />
                </Router>
              </HelmetProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </AuthProvider>
      </ApolloProvider>
    </Suspense>
  )
}

export default App
