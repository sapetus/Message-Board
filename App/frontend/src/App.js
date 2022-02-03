import React, { useEffect, useState } from 'react'
import {
  Routes,
  Route,
  Link
} from 'react-router-dom'
import { useApolloClient } from '@apollo/client'
import { useNavigate } from 'react-router-dom'

import LandingPage from './LandingPage/LandingPage';
import DiscussionPage from './DiscussionPage/DiscussionPage';
import PostPage from './PostPage/PostPage';
import RegisterPage from './RegisterPage/RegisterPage';
import LogInPage from './LogInPage/LogInPage';
import UserPage from './UserPage/UserPage'

const App = () => {
  const [token, setToken] = useState(null)

  const navigate = useNavigate()
  const client = useApolloClient()

  //check if the token is still in localstorage after last session
  useEffect(() => {
    if (localStorage.getItem('message_board_user_token')) {
      setToken(localStorage.getItem('message_board_user_token'))
    }
  }, [])

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    client.cache.reset()
    navigate('/')
  }

  return (
    <div id="main" >
      <nav>
        <Link to="/" >
          Home
        </Link>
        {token &&
          <Link to={`/user/${localStorage.getItem('username')}`} >
            Profile
          </Link>}
        {!token &&
          <Link to="log-in" >
            Log In
          </Link>}
        {!token &&
          <Link to="register" >
            Register
          </Link>
        }
        {token && <button onClick={logout}>Log Out</button>}
      </nav>

      <Routes>
        <Route path="/" element={<LandingPage token={token} />} />
        <Route path={`/discussion/:name`} element={<DiscussionPage token={token} />} />
        <Route path={`/log-in`} element={<LogInPage setToken={setToken} />} />
        <Route path={`/post/:id`} element={<PostPage token={token} />} />
        <Route path={`/register`} element={<RegisterPage />} />
        <Route path={`/user/:username`} element={<UserPage />} />
        <Route path="*" element={
          <div>
            <p>Are you lost?</p>
          </div>
        } />
      </Routes>
    </div>
  )
}

export default App;