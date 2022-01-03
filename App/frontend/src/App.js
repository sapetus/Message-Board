import React, { useEffect, useState } from 'react'
import {
  Routes,
  Route,
  Link
} from 'react-router-dom'
import { useApolloClient } from '@apollo/client';

import LandingPage from './LandingPage/LandingPage';
import DiscussionPage from './DiscussionPage/DiscussionPage';
import PostPage from './PostPage/PostPage';
import RegisterPage from './RegisterPage/RegisterPage';
import LogInPage from './LogInPage/LogInPage';

const App = () => {
  const [token, setToken] = useState(null)

  //check if the token is still in localstorage after last session
  useEffect(() => {
    if (localStorage.getItem('user_token')) {
      setToken(localStorage.getItem('user_token'))
    }
  }, [])

  const client = useApolloClient()

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  return (
    <div id="main">
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          {!token &&
            <li>
              <Link to="log-in">Log In</Link>
            </li>}
          {!token &&
            <li>
              <Link to="register">Register</Link>
            </li>}
          {token && <button onClick={logout}>Log Out</button>}
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<LandingPage token={token} />} />
        <Route path={`/discussion/:name`} element={<DiscussionPage token={token} />} />
        <Route path={`/log-in`} element={<LogInPage setToken={setToken} />} />
        <Route path={`/post/:id`} element={<PostPage token={token} />} />
        <Route path={`/register`} element={<RegisterPage />} />
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