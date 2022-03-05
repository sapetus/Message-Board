import React, { useState } from 'react'
import { useMutation } from '@apollo/client'

import { CREATE_COMMENT, CREATE_MESSAGE } from '../GraphQL/mutations'
import { FIND_COMMENTS_BY_POST } from '../GraphQL/queries'

const CreateCommentForm = ({
  postId, commentId, postCreatorId, commentCreatorId,
  fetched, setFetched, responseToComment, setMessage
}) => {
  const [text, setText] = useState('')
  const [showForm, setShowForm] = useState(false)

  const [createComment] = useMutation(
    CREATE_COMMENT,
    {
      onError: (error) => {
        console.log(error.graphQLErrors[0].message)
        setMessage(error.graphQLErrors[0].message)
      },
      update: (store, response) => {
        const dataInStore = store.readQuery({ query: FIND_COMMENTS_BY_POST, variables: { id: postId } })
        const newComment = { ...response.data.createComment, listOfLikeUsers: [], listOfDislikeUsers: [] }
        store.writeQuery({
          query: FIND_COMMENTS_BY_POST,
          variables: { id: postId },
          data: {
            ...dataInStore,
            findCommentsByPost: [...dataInStore.findCommentsByPost, newComment]
          }
        })
      }
    })

  const [createMessage] = useMutation(
    CREATE_MESSAGE,
    {
      onError: (error) => {
        console.log(error.graphQLErrors[0].message)
      }
    }
  )

  const submit = async (event) => {
    event.preventDefault()

    const { data } = await createComment({ variables: { text, postId, commentId } })

    if (data) {
      if (responseToComment) {
        //message to the creator of a comment that someone commented on their comment
        await createMessage({
          variables: {
            userId: commentCreatorId,
            responderId: data.createComment.user.id,
            commentId: data.createComment.id,
            responseTo: "COMMENT"
          }
        })
        //message to the creator of the post that someone commented on their post
        await createMessage({
          variables: {
            userId: postCreatorId,
            responderId: data.createComment.user.id,
            postId, commentId: data.createComment.id,
            responseTo: "POST"
          }
        })
      } else {
        await createMessage({
          variables: {
            userId: postCreatorId,
            responderId: data.createComment.user.id,
            postId,
            commentId: data.createComment.id,
            responseTo: "POST"
          }
        })
      }

      setText('')
      setShowForm(false)
      setFetched(fetched + 1)
    }
  }

  if (commentId) {
    return (
      <div className='commentForm'>
        <button className="toggleButton" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Hide' : 'Reply'}
        </button>

        {showForm &&
          <form onSubmit={submit} className="commentFormArea">
            <textarea
              className='light'
              style={{ width: "80%" }}
              placeholder='Comment here...'
              columns="6"
              value={text}
              onChange={({ target }) => setText(target.value)}
            />
            <button className="toggleButton" type="submit">Create Comment</button>
          </form>
        }
      </div>
    )
  }

  return (
    <div className='commentForm'>
      <button className="toggleButton" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Hide' : 'Reply'}
      </button>

      {showForm &&
        <form onSubmit={submit} className="commentFormArea">
          <textarea
            style={{ width: "80%" }}
            placeholder='Comment here...'
            columns="6"
            value={text}
            onChange={({ target }) => setText(target.value)}
          />
          <button className="toggleButton" type="submit">Create Comment</button>
        </form>
      }
    </div>
  )
}

export default CreateCommentForm