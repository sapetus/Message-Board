import React from 'react'
import { useMutation } from '@apollo/client'
import { Link } from 'react-router-dom'

import { USER_MESSAGES } from '../GraphQL/queries'
import { DELETE_MESSAGE } from '../GraphQL/mutations'

const Message = ({ message, username }) => {
  const [deleteMessage] = useMutation(DELETE_MESSAGE, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    },
    update: (store, response) => {
      const dataInStore = store.readQuery({ query: USER_MESSAGES, variables: { username } })
      const updatedData = dataInStore.userMessages.filter(
        message => message.id !== response.data.deleteMessage.id
      )
      store.writeQuery({
        query: USER_MESSAGES,
        variables: { username },
        data: {
          userMessages: updatedData
        }
      })
    }
  })

  const deleteThisMessage = () => {
    deleteMessage({ variables: { id: message.id } })
  }

  return (
    <div className="userMessage">
      {message.post
        ? <p>
          <Link to={`/user/${message.user.username}`}>
            {message.user.username}
          </Link>
          commented your post
          <Link to={`/post/${message.post.id}`}>
            {message.post.title}
          </Link>
        </p>
        : <p>
          <Link to={`/user/${message.user.username}`}>
            {message.user.username}
          </Link>
          commented your
          <Link to={`/post/${message.comment.post.id}/#${message.comment.id}`}>
            comment
          </Link>
        </p>
      }
      <button onClick={deleteThisMessage}>Delete</button>
    </div>
  )
}

export default Message