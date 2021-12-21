import React, { useState } from 'react'
import { useMutation } from '@apollo/client'

import { CREATE_DISCUSSION } from '../mutations'

const CreateDiscussionForm = ({ updateDiscussions }) => {
  const [name, setName] = useState('')

  const [createDiscussion] = useMutation(CREATE_DISCUSSION, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    }
  })

  const submit = async (event) => {
    event.preventDefault()

    createDiscussion({ variables: { name } })
    updateDiscussions()
    setName('')
  }

  return (
    <div>
      <h3>Create Discussion Form</h3>
      <form onSubmit={submit}>
        <div className='formField'>
          Name
          <input
            value={name}
            onChange={({ target }) => setName(target.value)}
          />
        </div>
        <button type='submit'>Create Discussion</button>
      </form>
    </div>
  )
}

export default CreateDiscussionForm