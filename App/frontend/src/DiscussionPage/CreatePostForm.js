import React, { useState } from 'react'
import { useMutation } from '@apollo/client'

import { CREATE_POST } from '../mutations'

const CreatePostForm = ({ discussionName, updateDiscussion }) => {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')

  const [createPost] = useMutation(CREATE_POST, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    }
  })

  const submit = async (event) => {
    event.preventDefault()

    createPost({ variables: { title, text, discussionName: discussionName } })
    updateDiscussion()
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