import React, { useState } from 'react'
import { useMutation } from '@apollo/client'

import { CREATE_COMMENT } from '../GraphQL/mutations'
import { FIND_COMMENTS_BY_POST } from '../GraphQL/queries'

const CreateCommentForm = ({ postId, commentId }) => {
  const [text, setText] = useState('')

  const [createComment] = useMutation(
    CREATE_COMMENT,
    {
      onError: (error) => {
        console.log(error.graphQLErrors[0].message)
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

  const submit = async (event) => {
    event.preventDefault()

    await createComment({ variables: { text, postId, commentId } })
    setText('')
  }

  return (
    <div className='form'>
      <h3>Comment</h3>
      <form onSubmit={submit}>
        <div className="formField">
          Text
          <input
            value={text}
            onChange={({ target }) => setText(target.value)}
          />
        </div>
        <button type="submit">Create Comment</button>
      </form>
    </div>
  )
}

export default CreateCommentForm