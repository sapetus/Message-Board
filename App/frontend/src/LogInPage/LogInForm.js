import React, { useEffect, useState } from 'react'
import { useMutation } from '@apollo/client'
import { useNavigate } from 'react-router-dom'

import { LOG_IN } from '../mutations'

const LogInForm = ({ setToken }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()

  const [login, result] = useMutation(LOG_IN, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    }
  })

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value
      setToken(token)
      localStorage.setItem('user_token', token)
      navigate('/')
    }
  }, [result.data]) //eslint-disable-line

  const submit = async (event) => {
    event.preventDefault()

    await login({ variables: { username, password } })

    setUsername('')
    setPassword('')
  }

  return (
    <div className='form'>
      <form onSubmit={submit}>
        <div className='formField'>
          Username
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div className='formField'>
          Password
          <input
            type='password'
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">Log In</button>
      </form>
    </div>
  )
}

export default LogInForm