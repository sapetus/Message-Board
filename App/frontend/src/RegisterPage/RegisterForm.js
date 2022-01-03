import React, { useState } from 'react'
import { useMutation } from '@apollo/client'

import { CREATE_USER } from '../mutations'

const RegisterForm = (props) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [createUser] = useMutation(CREATE_USER, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    }
  })

  const submit = (event) => {
    event.preventDefault()

    if (password !== confirmPassword) {
      console.log('Password and Confirm Password need to match!')
    } else {
      createUser({ variables: { username, password } })

      setUsername('')
      setPassword('')
      setConfirmPassword('')

      console.log("Registration successful")
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