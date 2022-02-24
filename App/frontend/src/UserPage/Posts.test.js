import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { MockedProvider } from '@apollo/client/testing'
import { MemoryRouter } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'

import Posts from './Posts'
import { GET_POSTS_BY_USER } from '../GraphQL/queries'

test('renders properly', async () => {
  const postsByUserMock = {
    request: {
      query: GET_POSTS_BY_USER,
      variables: {
        username: "TestUser",
        first: 5,
        order: "NEW"
      }
    },
    result: {
      data: {
        findPostsByUser: [
          {
            id: "123abc",
            title: "Post Title",
            text: "Post Text",
            likes: 10,
            dislikes: 9,
            amountOfComments: 5,
            discussion: {
              id: "321cba",
              name: "Discussion Name"
            }
          }
        ]
      },
      fetchMore: () => console.log('fetch more')
    }
  }

  render(
    <MockedProvider mocks={[postsByUserMock]} addTypename={false}>
      <MemoryRouter>
        <Posts username={"TestUser"} amountToFetch={5} />
      </MemoryRouter>
    </MockedProvider>
  )

  await waitFor(() => {
    expect(screen.getByText('Discussion Name')).toBeDefined()
  })
  await waitFor(() => {
    expect(screen.getByText('Post Title')).toBeDefined()
  })
  await waitFor(() => {
    expect(screen.getByText('Post Text')).toBeDefined()
  })
})