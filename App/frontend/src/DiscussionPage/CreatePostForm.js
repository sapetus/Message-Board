import React, { useState } from 'react'
import { useMutation } from '@apollo/client'

import { CREATE_POST } from '../GraphQL/mutations'
import { GET_POSTS_BY_DISCUSSION } from '../GraphQL/queries'

const CreatePostForm = ({ discussionName }) => {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')

  const [createPost] = useMutation(CREATE_POST, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    },
    update: (store, response) => {
      const dataInStore = store.readQuery({ query: GET_POSTS_BY_DISCUSSION, variables: { name: discussionName } })
      store.writeQuery({
        query: GET_POSTS_BY_DISCUSSION,
        variables: { name: discussionName },
        data: {
          ...dataInStore,
          findPostsByDiscussion: [...dataInStore.findPostsByDiscussion, response.data.createPost]
        }
      })
    }
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