import React, { useState } from 'react'
import { useMutation } from '@apollo/client'
import { useNavigate } from 'react-router-dom'

import { CREATE_DISCUSSION } from '../GraphQL/mutations'
import { ALL_DISCUSSIONS } from '../GraphQL/queries'

const CreateDiscussionForm = ({ setMessage }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const navigate = useNavigate()

  const [createDiscussion] = useMutation(CREATE_DISCUSSION, {
    onError: (error) => {
      setMessage(error.graphQLErrors[0].message)
    },
    update: (store, response) => {
      const dataInStore = store.readQuery({ query: ALL_DISCUSSIONS })
      store.writeQuery({
        query: ALL_DISCUSSIONS,
        data: {
          ...dataInStore,
          allDiscussions: [...dataInStore.allDiscussions, response.data.createDiscussion]
        }
      })
    }
  })

  const submit = async (event) => {
    event.preventDefault()

    const { data } = await createDiscussion({ variables: { name, description } })
    setName('')
    setDescription('')

    if (data) {
      navigate(`/discussion/${data.createDiscussion.name}`)
    }
  }

  return (
    <div className="formContainer">
      <form id="discussionForm" onSubmit={submit}>
        <input
          id="discussionName"
          type='text'
          placeholder='Name'
          value={name}
          onChange={({ target }) => setName(target.value)}
        />
        <textarea
          id="discussionDescription"
          placeholder='Describe the discussion'
          value={description}
          rows="6"
          onChange={({ target }) => setDescription(target.value)}
        />
        <button type='submit' className="formButton">Create</button>
      </form>
    </div>
  )
}

export default CreateDiscussionForm