import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { FIND_COMMENTS_BY_POST } from '../GraphQL/queries'
import { CREATE_COMMENT } from '../GraphQL/mutations'
import CreateCommentForm from './CreateCommentForm'
import { InMemoryCache } from '@apollo/client'

test('creation of a comment is successful', async () => {
  const createCommentMock = {
    request: {
      query: CREATE_COMMENT,
      variables: {
        text: "This is a test comment",
        postId: "123abc",
        commentId: "abc123"
      }
    },
    result: {
      data: {
        createComment: {
          id: "112233",
          text: "This is a test comment",
          likes: 0,
          dislikes: 0,
          user: {
            id: "aabbcc",
            username: "TestUser"
          },
          responseTo: {
            id: "abc123",
            text: "This is also a test comment"
          }
        }
      }
    }
  }

  //initialize the cache with a query that the CreateCommentForm updates,
  //without this, there is nothing to update, and the update function fails
  const cache = new InMemoryCache()
  cache.writeQuery({
    query: FIND_COMMENTS_BY_POST,
    variables: { id: "123abc" },
    data: {
      findCommentsByPost: []
    }
  })

  //this will increment on succesful creation
  let amount = 0

  render(
    <MockedProvider mocks={[createCommentMock]} cache={cache}>
      <CreateCommentForm
        postId={"123abc"} commentId={"abc123"}
        fetched={amount} setFetched={() => amount++}
      />
    </MockedProvider>
  )

  userEvent.click(screen.getByText('Reply'))
  userEvent.type(screen.getByPlaceholderText('Comment here...'), "This is a test comment")
  userEvent.click(screen.getByText('Create Comment'))

  await waitFor(() => {
    expect(amount).toEqual(1)
  })
})