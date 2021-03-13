import { Suspense } from 'react'

import { setLocale } from '@kathena/libs/yup'
import yupViLocale from '@kathena/libs/yupViLocale'
import { ThemeProvider } from '@kathena/theme'
import Spinner from '@kathena/ui/Spinner'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { BrowserRouter as Router } from 'react-router-dom'

import AppRoute from './App.route'

setLocale(yupViLocale)

function App() {
  return (
    <Suspense fallback={<Spinner container="fullscreen" />}>
      <ThemeProvider>
        <HelmetProvider>
          <Helmet
            defaultTitle="Kathena Platform"
            titleTemplate="%s – Kathena Platform"
          />
          <Router>
            <AppRoute />
          </Router>
        </HelmetProvider>
      </ThemeProvider>
    </Suspense>
  )
}

export default App
