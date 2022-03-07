import React, { useState } from 'react'
import { useMutation } from '@apollo/client'

import { CREATE_USER } from '../GraphQL/mutations'

const RegisterForm = ({ setMessage }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [createUser] = useMutation(CREATE_USER, {
    onError: (error) => {
      setMessage(error.graphQLErrors[0].message)
    },
    onCompleted: () => {
      setMessage('Registration successful')
    }
  })

  const submit = (event) => {
    event.preventDefault()

    if (password === '') {
      setMessage('Please provide a password')
    } else if (password !== confirmPassword) {
      setMessage('Passwords need to match')
      setPassword('')
      setConfirmPassword('')
    } else {
      createUser({ variables: { username, password } })

      setUsername('')
      setPassword('')
      setConfirmPassword('')
    }
  }

  return (
    <div className='formContainer'>
      <form id="credentialForm" onSubmit={submit}>
        <input
          id="username"
          placeholder='Username'
          value={username}
          onChange={({ target }) => setUsername(target.value)}
        />
        <input
          id="password"
          placeholder='Password'
          value={password}
          onChange={({ target }) => setPassword(target.value)}
          type="password"
        />
        <input
          id="confirmPassword"
          placeholder='Confirm Password'
          value={confirmPassword}
          onChange={({ target }) => setConfirmPassword(target.value)}
          type="password"
        />
        <button id="submitUser" type="submit" className="formButton">Register</button>
      </form>
    </div>
  )
}

export default RegisterForm