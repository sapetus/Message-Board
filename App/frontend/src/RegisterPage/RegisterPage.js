import React, { useState } from 'react'

import RegisterForm from './RegisterForm'
import Modal from '../Components/Modal'

const RegisterPage = (props) => {
  const [message, setMessage] = useState(null)

  return (
    <div id="page">
      {message && <Modal text={message} setMessage={setMessage} />}
      <h1>Register</h1>
      <RegisterForm setMessage={setMessage} />
    </div>
  )
}

export default RegisterPage