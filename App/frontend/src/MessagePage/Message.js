import React from 'react'
import { useMutation } from '@apollo/client'

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
        ? <p>{message.user.username} commented your post: {message.post.title}</p>
        : <p>{message.user.username} commented you comment: {message.comment.text}</p>
      }
      <button onClick={deleteThisMessage}>Delete</button>
    </div>
  )
}

export default Message