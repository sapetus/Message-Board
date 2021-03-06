import React, { useEffect, useState } from 'react'
import {
  Routes,
  Route,
  Link
} from 'react-router-dom'
import { useApolloClient, useLazyQuery } from '@apollo/client'
import { useNavigate } from 'react-router-dom'

import { USER_NEW_MESSAGES_AMOUNT } from './GraphQL/queries'

import LandingPage from './LandingPage/LandingPage';
import DiscussionPage from './DiscussionPage/DiscussionPage';
import PostPage from './PostPage/PostPage';
import RegisterPage from './RegisterPage/RegisterPage';
import LogInPage from './LogInPage/LogInPage';
import UserPage from './UserPage/UserPage'
import FaqPage from './FaqPage/FaqPage';
import MessagePage from './MessagePage/MessagePage'

const App = () => {
  const [token, setToken] = useState(null)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [y, setY] = useState(0)

  const navigate = useNavigate()
  const client = useApolloClient()

  const [userNewMessagesAmount, { data }] = useLazyQuery(
    USER_NEW_MESSAGES_AMOUNT,
    {
      fetchPolicy: "cache-and-network"
    }
  )

  //now this works each time user navigates through the site
  useEffect(() => {
    const nameInStore = localStorage.getItem('username')
    if (nameInStore) {
      userNewMessagesAmount({ variables: { username: nameInStore } })
    }
  }, [navigate]) //eslint-disable-line

  //check if the token is still in localstorage after last session
  useEffect(() => {
    if (localStorage.getItem('message_board_user_token')) {
      setToken(localStorage.getItem('message_board_user_token'))
    }
  }, [])

  useEffect(() => {
    window.addEventListener("scroll", () => setY(window.scrollY))

    return () => {
      window.removeEventListener("scroll", () => setY(window.scrollY))
    }
  })

  useEffect(() => {
    if (y > 100 && !showBackToTop) {
      setShowBackToTop(true)
    } else if (y < 100 && showBackToTop) {
      setShowBackToTop(false)
    }
  }, [y]) //eslint-disable-line

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    client.cache.reset()
    navigate('/')
  }

  const backToTop = () => {
    window.scrollTo(0, 0)
  }

  return (
    <div id="main" >
      <nav>
        <Link to="/" >
          Home
        </Link>
        {token &&
          <Link to={`/messages`} className="navItem">
            {/* {data?.userMessagesAmount > 0 &&
              <i id="userAlertBell" className="material-icons">notifications</i>
            } */}
            {(data?.userNewMessagesAmount > 0 && data?.userNewMessagesAmount < 10) &&
              <p id="userAlertBubble">{data.userNewMessagesAmount}</p>
            }
            {data?.userNewMessagesAmount >= 10 &&
              <p id="userAlertBubble">+9</p>
            }
            Messages
          </Link>
        }
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
        {token && <button className="logOut" onClick={logout}>Log Out</button>}
      </nav>

      {showBackToTop && <p id='backToTop' onClick={backToTop}>Back To Top</p>}

      <Routes>
        <Route path="/" element={<LandingPage token={token} />} />
        <Route path={`/discussion/:name`} element={<DiscussionPage token={token} />} />
        <Route path={`/faq`} element={<FaqPage />} />
        <Route path={`/log-in`} element={<LogInPage setToken={setToken} />} />
        <Route path={`/messages`} element={<MessagePage token={token} />} />
        <Route path={`/post/:id`} element={<PostPage token={token} />} />
        <Route path={`/register`} element={<RegisterPage />} />
        <Route path={`/user/:username`} element={<UserPage />} />
        <Route path="*" element=
          {<div>
            <p>Are you lost?</p>
          </div>}
        />
      </Routes>

      <footer>
        <p className='dividerHorizontal' />
        <Link to="/faq">FAQ</Link>
      </footer>
    </div>
  )
}

export default App;