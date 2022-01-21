import React, { useState } from 'react'
import { useMutation } from '@apollo/client'

import { CREATE_DISCUSSION } from '../GraphQL/mutations'
import { ALL_DISCUSSIONS } from '../GraphQL/queries'

const CreateDiscussionForm = () => {
  const [name, setName] = useState('')

  const [createDiscussion] = useMutation(CREATE_DISCUSSION, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
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

    createDiscussion({ variables: { name } })
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