import React from 'react'

import LogInForm from './LogInForm'

const LogInPage = ({ setToken }) => {
  return (
    <div>
      <h1>Log In</h1>
      <LogInForm setToken={setToken} />
    </div>
  )
}

export default LogInPage