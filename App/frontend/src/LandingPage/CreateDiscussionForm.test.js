import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InMemoryCache } from '@apollo/client'
import { act } from 'react-dom/test-utils'
import { MemoryRouter } from 'react-router-dom'

import CreateDiscussionForm from './CreateDiscussionForm'
import { CREATE_DISCUSSION } from '../GraphQL/mutations'
import { ALL_DISCUSSIONS } from '../GraphQL/queries'

test('Creation of a discussion is successful', async () => {
  const createDiscussionMock = {
    request: {
      query: CREATE_DISCUSSION,
      variables: {
        name: "TestDiscussion",
        description: "Test Discussion Description"
      }
    },
    result: {
      data: {
        createDiscussion: {
          id: "123abc",
          name: "TestDiscussion",
          description: "Test Discussion Description",
          members: 0
        }
      }
    }
  }

  //initialize the cache with a query that the CreateDiscussionForm updates,
  //without this, there is nothing to update, and the update function fails
  const cache = new InMemoryCache()
  cache.writeQuery({
    query: ALL_DISCUSSIONS,
    data: { allDiscussions: [] }
  })

  render(
    <MockedProvider mocks={[createDiscussionMock]} cache={cache}>
      <MemoryRouter>
        <CreateDiscussionForm />
      </MemoryRouter>
    </MockedProvider>
  )

  userEvent.type(screen.getByPlaceholderText('Name'), "TestDiscussion")
  userEvent.type(screen.getByPlaceholderText('Describe the discussion'), "Test Discussion Description")
  userEvent.click(screen.getByText('Create'))

  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0))
  })

  const { allDiscussions: data } = cache.readQuery({ query: ALL_DISCUSSIONS })

  expect(data[0]).toEqual(createDiscussionMock.result.data.createDiscussion)
})