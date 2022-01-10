import React, { useState } from 'react'
import { useMutation } from '@apollo/client'

import { CREATE_POST } from '../GraphQL/mutations'
import { FIND_DISCUSSION } from '../GraphQL/queries'

const CreatePostForm = ({ discussionName }) => {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')

  const [createPost] = useMutation(CREATE_POST, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    },
    refetchQueries: [{ query: FIND_DISCUSSION, variables: { name: discussionName } }]
  })

  const submit = async (event) => {
    event.preventDefault()

    createPost({ variables: { title, text, discussionName: discussionName } })
    setTitle('')
    setText('')
  }

  return (
    <div className="form">
      <h3>Create your own post</h3>
      <form onSubmit={submit}>
        <div className="formField">
          Title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div className='formField'>
          Text
          <input
            value={text}
            onChange={({ target }) => setText(target.value)}
          />
        </div>
        <button type='submit'>Create Post</button>
      </form>
    </div>
  )
}

export default CreatePostForm