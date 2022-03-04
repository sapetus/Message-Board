import React, { useEffect, useState } from 'react'
import { useMutation } from '@apollo/client'
import { useNavigate } from 'react-router-dom'

import { LOG_IN } from '../GraphQL/mutations'

const LogInForm = ({ setToken, setMessage }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()

  const [login, result] = useMutation(LOG_IN, {
    onError: (error) => {
      setMessage(error.graphQLErrors[0].message)
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
    <div className='formContainer'>
      <form id="credentialForm" onSubmit={submit}>
        <input
          placeholder='Username'
          value={username}
          onChange={({ target }) => setUsername(target.value)}
        />
        <input
          placeholder='Password'
          type='password'
          value={password}
          onChange={({ target }) => setPassword(target.value)}
        />
        <button type="submit" className="formButton">Log In</button>
      </form>
    </div>
  )
}

export default LogInForm