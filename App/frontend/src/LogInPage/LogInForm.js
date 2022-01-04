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
      localStorage.setItem('message_board_user_token', token)
      navigate('/')
    }
  }, [result.data]) //eslint-disable-line

  const submit = async (event) => {
    event.preventDefault()

    await login({ variables: { username, password } })

    //this is used to access users own page from app.js
    //theres probably a better way to do this, but for now this works
    localStorage.setItem("username", username)

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