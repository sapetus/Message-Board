import React, { useEffect, useState } from 'react'
import { useLazyQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

import { GET_USER_BY_NAME } from '../GraphQL/queries'
import Posts from './Posts'
import Comments from './Comments'
import Subscriptions from './Subscriptions'

const UserPage = ({ token }) => {
  const [username, setUsername] = useState('')
  const [totalLikes, setTotalLikes] = useState(0)
  const [totalDislikes, setTotalDislikes] = useState(0)
  const [creationDate, setCreationDate] = useState('')
  const [selection, setSelection] = useState('POSTS')

  let params = useParams()
  const amountToFetch = 5

  const [getUser, { data: getUserData }] = useLazyQuery(
    GET_USER_BY_NAME,
    { fetchPolicy: 'cache-and-network' }
  )

  useEffect(() => {
    getUser({ variables: { username: params.username } })
  }, [params.username]) //eslint-disable-line

  useEffect(() => {
    if (getUserData?.getUserByName) {
      const userData = getUserData.getUserByName
      setUsername(userData.username)
      setTotalLikes(userData.totalLikes)
      setTotalDislikes(userData.totalDislikes)
      //this is here temporary, as not all users have creationDate data
      if (userData.creationDate) {
        setCreationDate(parseDate(userData.creationDate))
      }
    }
  }, [getUserData])

  useEffect(() => {
    switch (selection) {
      case "POSTS":
        document.getElementById("selectionComment").style.backgroundColor = "transparent"
        document.getElementById("selectionSubscription").style.backgroundColor = "transparent"
        document.getElementById("selectionPost").style.backgroundColor = "#8C54F3"
        break
      case "COMMENTS":
        document.getElementById("selectionPost").style.backgroundColor = "transparent"
        document.getElementById("selectionSubscription").style.backgroundColor = "transparent"
        document.getElementById("selectionComment").style.backgroundColor = "#8C54F3"
        break
      case "SUBSCRIPTIONS":
        document.getElementById("selectionPost").style.backgroundColor = "transparent"
        document.getElementById("selectionComment").style.backgroundColor = "transparent"
        document.getElementById("selectionSubscription").style.backgroundColor = "#8C54F3"
        break
      default:
        break
    }
  }, [selection]) //eslint-disable-line

  const parseDate = (date) => {
    const year = date.slice(0, 4)
    const month = date.slice(5, 7)
    const day = date.slice(8, 10)

    return `${day}.${month}.${year}`
  }

  const showLess = (amount, setAmount) => {
    if (amount - amountToFetch >= amountToFetch) {
      setAmount(amount - amountToFetch)
    }
  }

  const style = {
    text: {
      padding: "5px 0px",
      margin: "0px"
    }
  }

  return (
    <div id="page">
      <div id="userInfoContainer">
        <h3>{username}</h3>
        <div className="userInfoSubcontainer">
          <div className='votes'>
            <i className="material-icons vote">thumb_up</i>{totalLikes}
            <i className='material-icons vote'>thumb_down</i>{totalDislikes}
          </div>
        </div>
        <div className="userInfoSubcontainer">
          <p style={style}>Creation Date</p>
          <h4 style={style}>{creationDate}</h4>
        </div>
      </div>

      <div id="userDataSelection">
        <button id="selectionPost" onClick={() => setSelection('POSTS')}>Posts</button>
        <button id="selectionComment" onClick={() => setSelection('COMMENTS')}>Comments</button>
        <button id="selectionSubscription" onClick={() => setSelection('SUBSCRIPTIONS')}>Subscriptions</button>
      </div>

      {selection === 'POSTS' &&
        <Posts
          username={params.username}
          amountToFetch={amountToFetch}
          showLess={showLess}
        />
      }

      {selection === 'COMMENTS' &&
        <Comments
          username={params.username}
          amountToFetch={amountToFetch}
          showLess={showLess}
        />
      }

      {selection === 'SUBSCRIPTIONS' &&
        <Subscriptions
          username={params.username}
          amountToFetch={amountToFetch}
          showLess={showLess}
        />
      }
    </div>
  )
}

export default UserPage