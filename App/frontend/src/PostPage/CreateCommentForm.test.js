import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InMemoryCache } from '@apollo/client'

import { FIND_COMMENTS_BY_POST } from '../GraphQL/queries'
import { CREATE_COMMENT, CREATE_MESSAGE } from '../GraphQL/mutations'
import CreateCommentForm from './CreateCommentForm'

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
  const createMessageMock_1 = {
    request: {
       query: CREATE_MESSAGE,
       variables: {
         userId: "zyx987",
         commentId: "112233",
         responseTo: "COMMENT"
       }
    },
    result: {
      data: {
        createMessage: {
          id: "aaabbb"
        }
      }
    }
  }
  const createMessageMock_2 = {
    request: {
      query: CREATE_MESSAGE,
      variables: {
        userId: "xyz789",
        postId: "123abc",
        commentId: "112233",
        responseTo: "POST"
      }
    },
    result: {
      data: {
        createMessage: {
          id: "bbbaaa"
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
    data: { findCommentsByPost: [] }
  })

  //this will increment on succesful creation
  let amount = 0

  render(
    <MockedProvider mocks={[createCommentMock, createMessageMock_1, createMessageMock_2]} cache={cache}>
      <CreateCommentForm
        postId={"123abc"} commentId={"abc123"}
        postCreatorId={"xyz789"} commentCreatorId={"zyx987"}
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