import { useEffect } from 'react'

import { useHistory, useLocation } from 'react-router-dom'

const AutoScrollToTop = () => {
  const { pathname } = useLocation()
  const history = useHistory()

  useEffect(() => {
    if (history.action === 'PUSH') {
      const rootEl = document.querySelector('html')
      rootEl?.scrollTo(0, 0)
    }
  }, [history.action, pathname])

  return null
}

export default AutoScrollToTop
