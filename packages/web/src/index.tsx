import React from 'react'

import ReactDOM from 'react-dom'

import App from './App'
import reportWebVitals from './reportWebVitals'

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
)

const disableDevtool = () => {
  document.getElementsByTagName('html')[0].oncontextmenu = () => false
  document.onkeydown = (e) => {
    if (e.keyCode === 123) {
      return false
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode === 'I'.charCodeAt(0)) {
      return false
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode === 'C'.charCodeAt(0)) {
      return false
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode === 'J'.charCodeAt(0)) {
      return false
    }
    if (e.ctrlKey && e.keyCode === 'U'.charCodeAt(0)) {
      return false
    }
    return true
  }
}
if (process.env.REACT_APP_ENABLE_DEVTOOL === 'false') {
  disableDevtool()
}
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
