import React, { useEffect, useState } from 'react'
import { useLazyQuery, useQuery, useMutation } from '@apollo/client'

import Message from './Message'

import { USER_MESSAGES, GET_CURRENT_USER, USER_MESSAGES_AMOUNT } from '../GraphQL/queries'
import { DELETE_ALL_MESSAGES_FOR_USER } from '../GraphQL/mutations'

const MessagePage = ({ token }) => {
  const [messages, setMessages] = useState(null)
  const [messagesFetched, setMessagesFetched] = useState(0)

  const amountToFetch = 5

  const { loading, data: currentUserData } = useQuery(
    GET_CURRENT_USER,
    {
      fetchPolicy: "cache-and-network"
    }
  )

  const [getUserMessages, { data: userMessagesData, fetchMore }] = useLazyQuery(
    USER_MESSAGES,
    {
      fetchPolicy: "cache-and-network"
    }
  )

  const [deleteAllMessages] = useMutation(DELETE_ALL_MESSAGES_FOR_USER, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    },
    update: (store, response) => {
      store.writeQuery({
        query: USER_MESSAGES,
        variables: {
          username: currentUserData.getCurrentUser.username
        },
        data: {
          userMessages: []
        }
      })
      store.writeQuery({
        query: USER_MESSAGES_AMOUNT,
        variables: { username: currentUserData.getCurrentUser.username },
        data: {
          userMessagesAmount: 0
        }
      })
    }
  })

  useEffect(() => {
    if (currentUserData?.getCurrentUser.username === localStorage.getItem('username')) {
      getUserMessages({
        variables: {
          username: currentUserData.getCurrentUser.username,
          first: amountToFetch
        }
      })
      setMessagesFetched(amountToFetch)
    }
  }, [currentUserData]) //eslint-disable-line

  useEffect(() => {
    setMessages(userMessagesData?.userMessages.slice(0, messagesFetched))
  }, [userMessagesData, messagesFetched])

  const deleteAll = () => {
    deleteAllMessages({ variables: { username: currentUserData.getCurrentUser.username } })
  }

  const fetchMoreMessages = async () => {
    const { data } = await fetchMore({
      variables: {
        username: currentUserData.getCurrentUser.username,
        first: amountToFetch,
        after: messagesFetched
      }
    })

    if (data.userMessages.length + userMessagesData.userMessages.length > messagesFetched) {
      setMessagesFetched(messagesFetched + amountToFetch)
    }
  }

  const showLess = () => {
    if (messagesFetched - amountToFetch >= amountToFetch) {
      setMessagesFetched(messagesFetched - amountToFetch)
    }
  }

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
    if (messages?.length > 0) {
      return (
        <div id="page">
          <h1 className='pageTitle'>Messages</h1>
          <p className="dividerHorizontal" />
          <button onClick={deleteAll}>Delete All</button>
          <div id="messages">
            {messages.map(message =>
              <Message key={message.id} message={message} username={currentUserData.getCurrentUser.username} />
            )}
          </div>
          <div className='controlAmountButtons'>
            <button onClick={fetchMoreMessages}>Show More</button>
            <button onClick={showLess}>Show Less</button>
          </div>
        </div>
      )
    } else {
      return (
        <div id="page">
          <h1 className='pageTitle'>Messages</h1>
          <p className="dividerHorizontal" />
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