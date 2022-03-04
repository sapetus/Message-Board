import React, { useState } from 'react'
import { useMutation } from '@apollo/client'
import { useNavigate } from 'react-router-dom'

import { CREATE_POST } from '../GraphQL/mutations'
import { GET_POSTS_BY_DISCUSSION } from '../GraphQL/queries'

const CreatePostForm = ({ discussionName, setMessage }) => {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [imageInput, setImageInput] = useState("")
  const [image, setImage] = useState(null)

  const navigate = useNavigate()

  const [createPost] = useMutation(CREATE_POST, {
    onError: (error) => {
      setMessage(error.graphQLErrors[0].message)
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

    const { data } = await createPost({
      variables: { title, text, discussionName, image }
    })

    setTitle('')
    setText('')
    setImage(null)

    if (data) {
      navigate(`/post/${data.createPost.id}`)
    }
  }

  const checkImage = (url) => {
    setImageInput(url)

    if (url.match(/\.(jpeg|jpg|gif|png)$/) !== null) {
      setImage(url)
    } else {
      setImage(null)
    }
  }

  return (
    <div className="formContainer">
      <h3>Create your own post</h3>
      <form id="postForm" onSubmit={submit}>
        <input
          type="text"
          placeholder='Title'
          value={title}
          onChange={({ target }) => setTitle(target.value)}
        />
        <textarea
          placeholder='Write your post here'
          value={text}
          rows="6"
          onChange={({ target }) => setText(target.value)}
        />
        <input
          type="text"
          placeholder="URL of an image"
          value={imageInput}
          onChange={({ target }) => checkImage(target.value)}
        />
        {image &&
          <img src={image} alt="Nothing found with url" />
        }
        <button type='submit' className='formButton'>Create Post</button>
      </form>
    </div>
  )
}

export default CreatePostForm