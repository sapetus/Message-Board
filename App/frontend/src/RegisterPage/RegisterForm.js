import React, { useState } from 'react'
import { useMutation } from '@apollo/client'

import { CREATE_USER } from '../mutations'

const RegisterForm = ({ setMessage }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [timeoutId, setTimeoutId] = useState(null)

  const [createUser] = useMutation(CREATE_USER, {
    onError: (error) => {
      setTimeoutId(timeOutMessage(error.graphQLErrors[0].message, 5000))
    },
    onCompleted: () => {
      setTimeoutId(timeOutMessage('Registration successful', 5000))
    }
  })

  const timeOutMessage = (message, messageTime) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    setMessage(message)

    const timeOutId = setTimeout(() => {
      setMessage(null)
    }, messageTime)

    return timeOutId
  }

  const submit = (event) => {
    event.preventDefault()

    if (password !== confirmPassword) {
      setMessage('Password and Confirm Password need to match')
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
    <div className='form'>
      <form onSubmit={submit}>
        <div>
          Username
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          Password
          <input
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            type="password"
          />
        </div>
        <div>
          Confirm Password
          <input
            value={confirmPassword}
            onChange={({ target }) => setConfirmPassword(target.value)}
            type="password"
          />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  )
}

export default RegisterForm