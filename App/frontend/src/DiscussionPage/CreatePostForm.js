import React, { useState } from 'react'
import { useMutation } from '@apollo/client'
import { useNavigate } from 'react-router-dom'

import { CREATE_POST } from '../GraphQL/mutations'
import { GET_POSTS_BY_DISCUSSION } from '../GraphQL/queries'

const CreatePostForm = ({ discussionName }) => {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [failedToLoadFile, setFailedToLoadFile] = useState(false)

  const navigate = useNavigate()

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

    if (failedToLoadFile) {
      console.log("File is not valid")
    } else {
      const { data } = await createPost({
        variables: { title, text, discussionName, image: file }
      })

      setTitle('')
      setText('')
      setFile(null)

      navigate(`/post/${data.createPost.id}`)
    }
  }

  const readFile = () => {
    const file = document.querySelector('input[type=file]').files[0]

    const reader = new FileReader()

    //might be good idea to compress images?
    //encode image??
    //implement somekind of security here?
    //best would be to allow only links to images or
    //save image to a hosting site and serve the url
    reader.addEventListener("load", () => {
      if (file.type.includes('image')) {
        if (file.size < 1100000) {
          setFailedToLoadFile(false)
          setFile(reader.result)
        } else {
          setFailedToLoadFile(true)
          console.log("size needs to be less than 1MB")
        }
      } else {
        setFailedToLoadFile(true)
        console.log("file needs to be an image")
      }
    }, false)

    if (file) {
      reader.readAsDataURL(file)
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
        {/* Image
        <input
          type="file"
          onChange={readFile}
        /> */}
        <button type='submit'>Create Post</button>
      </form>
    </div>
  )
}

export default CreatePostForm