import React, { useEffect, useState } from 'react'
import { useMutation } from '@apollo/client'

import { CREATE_USER } from '../GraphQL/mutations'

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

  useEffect(() => {
    const currentTimeoutId = timeoutId

    return () => {
      clearTimeout(currentTimeoutId)
    }
  }, [timeoutId])

  const timeOutMessage = (message, messageTime) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    setMessage(message)

    const newTimeoutId = setTimeout(() => {
      setMessage(null)
    }, messageTime)

    return newTimeoutId
  }

  const submit = (event) => {
    event.preventDefault()

    if (password !== confirmPassword) {
      setTimeoutId(timeOutMessage('Passwords need to match', 5000))
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
          placeholder='Username'
          value={username}
          onChange={({ target }) => setUsername(target.value)}
        />
        <input
          placeholder='Password'
          value={password}
          onChange={({ target }) => setPassword(target.value)}
          type="password"
        />
        <input
          placeholder='Confirm Password'
          value={confirmPassword}
          onChange={({ target }) => setConfirmPassword(target.value)}
          type="password"
        />
        <button type="submit" className="formButton">Register</button>
      </form>
    </div>
  )
}

export default RegisterForm