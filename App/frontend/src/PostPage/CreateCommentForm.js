import React, { useState } from 'react'
import { useMutation } from '@apollo/client'

import { CREATE_COMMENT } from '../GraphQL/mutations'
import { FIND_COMMENTS_BY_POST, FIND_POST } from '../GraphQL/queries'

const CreateCommentForm = ({ postId }) => {
  const [text, setText] = useState('')

  const [createComment] = useMutation(CREATE_COMMENT, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    },
    refetchQueries: [
      { query: FIND_POST, variables: { id: postId } },
      { query: FIND_COMMENTS_BY_POST, variables: { id: postId } }
    ]
  })

  const submit = async (event) => {
    event.preventDefault()

    createComment({ variables: { text, postId } })
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