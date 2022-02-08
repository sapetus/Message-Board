import React, { useState } from 'react'

import LogInForm from './LogInForm'

const LogInPage = ({ setToken }) => {
  const [message, setMessage] = useState(null)

  return (
    <div id="page">
      <h1>Log In</h1>
      <h3>{message}</h3>
      <LogInForm setToken={setToken} setMessage={setMessage}/>
    </div>
  )
}

export default LogInPage