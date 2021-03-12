import { Suspense } from 'react'

import { ThemeProvider } from '@kathena/theme'
import Spinner from '@kathena/ui/Spinner'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter as Router } from 'react-router-dom'

import AppRoute from './App.route'

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <ThemeProvider>
        <HelmetProvider>
          <Router>
            <AppRoute />
          </Router>
        </HelmetProvider>
      </ThemeProvider>
    </Suspense>
  )
}

export default App
