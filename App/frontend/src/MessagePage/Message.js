import React from 'react'
import { useMutation } from '@apollo/client'
import { Link } from 'react-router-dom'

import { USER_MESSAGES, USER_NEW_MESSAGES_AMOUNT } from '../GraphQL/queries'
import { DELETE_MESSAGE, MESSAGE_ACKNOWLEDGED } from '../GraphQL/mutations'

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
        query: USER_NEW_MESSAGES_AMOUNT,
        variables: { username },
        data: {
          userNewMessagesAmount: dataInStore.userNewMessagesAmount - 1
        }
      })
    }
  })

  const [acknowledgeMessage] = useMutation(MESSAGE_ACKNOWLEDGED, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    }
  })

  const deleteThisMessage = () => {
    deleteMessage({ variables: { id: message.id } })
  }

  const markSeen = () => {
    if (!message.seen) {
      acknowledgeMessage({ variables: { id: message.id } })
    }
  }

  const sliceText = (text, length) => {
    if (text.length > length) return text.slice(0, length - 3) + '...'

    return text
  }

  if (message.post) {
    return (
      <div className="messageContainer">
        <Link className='userMessage' to={`/post/${message.post.id}/#${message.comment.id}`} onClick={markSeen}>
          {!message.seen && <i className="material-icons newMessage">priority_high</i>}
          <h3>{message.responder.username} responded to your post in {message.post.discussion.name}</h3>
          <p className="smallText closeToTop">{sliceText(message.comment.text, 100)}</p>
        </Link>
        <button onClick={deleteThisMessage}>Delete</button>
        {/* <p className="dividerHorizontal"/> */}
      </div>
    )
  } else {
    return (
      <div className="messageContainer">
        <Link className="userMessage" to={`/post/${message.comment.post.id}/#${message.comment.id}`} onClick={markSeen}>
          {!message.seen && <i className="material-icons newMessage">priority_high</i>}
          <h3>{message.responder.username} responded to your comment in {message.comment.post.discussion.name}</h3>
          <p className="smallText closeToTop">{sliceText(message.comment.text, 100)}</p>
        </Link>
        <button onClick={deleteThisMessage}>Delete</button>
        {/* <p className="dividerHorizontal"/> */}
      </div>
    )
  }
}

export default Message