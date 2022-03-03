import React, { useState } from 'react'

import LogInForm from './LogInForm'
import Modal from '../Components/Modal'

const LogInPage = ({ setToken }) => {
  const [message, setMessage] = useState(null)

  return (
    <div id="page">
      {message && <Modal text={message} setMessage={setMessage} />}
      <h1>Log In</h1>
      <LogInForm setToken={setToken} setMessage={setMessage} />
    </div>
  )
}

export default LogInPage