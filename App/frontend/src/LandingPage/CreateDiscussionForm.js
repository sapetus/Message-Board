import React, { useState } from 'react'
import { useMutation } from '@apollo/client'
import { useNavigate } from 'react-router-dom'

import { CREATE_DISCUSSION } from '../GraphQL/mutations'
import { ALL_DISCUSSIONS } from '../GraphQL/queries'

const CreateDiscussionForm = () => {
  const [name, setName] = useState('')

  const navigate = useNavigate()

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

    const { data } = await createDiscussion({ variables: { name } })
    setName('')

    navigate(`/discussion/${data.createDiscussion.name}`)
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