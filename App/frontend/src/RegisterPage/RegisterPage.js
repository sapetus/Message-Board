import React, { useState } from 'react'

import RegisterForm from './RegisterForm'

const RegisterPage = (props) => {
  const [message, setMessage] = useState(null)
 
  return (
    <div id="registerPage">
      <h1>Register</h1>
      <h3>{message}</h3>
      <RegisterForm setMessage={setMessage}/>
    </div>
  )
} 

export default RegisterPage