import React, { useEffect, useState } from 'react'
import { useLazyQuery, useQuery } from '@apollo/client'

import Message from './Message'

import { USER_MESSAGES, GET_CURRENT_USER } from '../GraphQL/queries'

const MessagePage = ({ token }) => {
  const [messages, setMessages] = useState(null)

  const { loading, data: currentUserData } = useQuery(
    GET_CURRENT_USER,
    {
      fetchPolicy: "cache-and-network"
    }
  )

  const [getUserMessages, { data: userMessagesData }] = useLazyQuery(
    USER_MESSAGES,
    {
      fetchPolicy: "cache-and-network"
    }
  )

  useEffect(() => {
    if (currentUserData?.getCurrentUser.username === localStorage.getItem('username')) {
      getUserMessages({ variables: { username: currentUserData.getCurrentUser.username } })
    }
  }, [currentUserData]) //eslint-disable-line

  useEffect(() => {
    setMessages(userMessagesData?.userMessages)
  }, [userMessagesData])

  //when loading
  if (loading) {
    return (
      <div id="page">
        <p>Loading...</p>
      </div>
    )
  }

  //actual contents
  if (token && currentUserData.getCurrentUser.username === localStorage.getItem('username')) {
    if (messages) {
      return (
        <div id="page">
          {messages.map(message =>
            <Message key={message.id} message={message} />
          )}
        </div>
      )
    } else {
      return (
        <div id="page">
          <p>You have no messages</p>
        </div>
      )
    }
  }

  //if user is not supposed to be here
  return (
    <div id="page">
      <p>Sorry, can't view this page</p>
    </div>
  )
}

export default MessagePage