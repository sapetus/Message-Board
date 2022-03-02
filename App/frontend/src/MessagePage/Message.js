import React from 'react'
import { useMutation } from '@apollo/client'
import { Link } from 'react-router-dom'

import { USER_MESSAGES, USER_MESSAGES_AMOUNT } from '../GraphQL/queries'
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
      store.writeQuery({
        query: USER_MESSAGES_AMOUNT,
        variables: { username },
        data: {
          userMessagesAmount: dataInStore.userMessagesAmount - 1
        }
      })
    }
  })

  const deleteThisMessage = () => {
    deleteMessage({ variables: { id: message.id } })
  }

  if (message.post) {
    const postText = message.post.title.length > 23
      ? message.post.title.slice(0, 20) + '...'
      : message.post.title
    return (
      <div className="messageContainer">
        <Link className='userMessage' to={`/post/${message.post.id}`}>
          Someone commented on your post: '{postText}'
        </Link>
        <button onClick={deleteThisMessage}>Delete</button>
      </div>
    )
  } else {
    const commentText = message.comment.text.length > 25
      ? message.comment.text.slice(0, 22) + '...'
      : message.comment.text
    return (
      <div className="messageContainer">
        <Link className="userMessage" to={`/post/${message.comment.post.id}/#${message.comment.id}`}>
          Someone commented your comment with: '{commentText}'
        </Link>
        <button onClick={deleteThisMessage}>Delete</button>
      </div>
    )
  }
}

export default Message