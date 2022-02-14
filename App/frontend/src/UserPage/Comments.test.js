import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { MockedProvider } from '@apollo/client/testing'
import { MemoryRouter } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'

import Comments from './Comments'
import { GET_COMMENTS_BY_USER } from '../GraphQL/queries'

test('renders properly', async () => {
  //this mock doesn't work, can't find a problem in it though...
  const commentsByUserMock = {
    request: {
      query: GET_COMMENTS_BY_USER,
      variables: {
        username: "TestUser",
        first: 5,
        order: "NEW"
      }
    },
    result: {
      data: {
        findCommentsByUser: [
          {
            id: "1",
            text: "Comment Text",
            likes: 10,
            dislikes: 9,
            post: {
              id: "11",
              title: "Post Title",
              discussion: {
                id: "111",
                name: "Discussion Name"
              }
            }
          }
        ]
      },
      fetchMore: () => console.log('fetch more')
    }
  }

  render(
    <MockedProvider mocks={[commentsByUserMock]} addTypename={false}>
      <MemoryRouter>
        <Comments username={"TestUser"} amountToFetch={5} />
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
    expect(screen.getByText('Comment Text')).toBeDefined()
  })
})