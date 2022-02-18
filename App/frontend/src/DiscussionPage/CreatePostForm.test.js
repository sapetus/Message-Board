import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InMemoryCache } from '@apollo/client'
import { act } from 'react-dom/test-utils'
import { MemoryRouter } from 'react-router-dom'

import CreatePostForm from './CreatePostForm'
import { CREATE_POST } from '../GraphQL/mutations'
import { GET_POSTS_BY_DISCUSSION } from '../GraphQL/queries'

const wait = async (time = 0) => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, time))
  })
}

test('new post can be created', async () => {
  const createPostMock = {
    request: {
      query: CREATE_POST,
      variables: {
        title: "Test Post",
        text: "Test Text",
        discussionName: "Discussion Name",
        image: null
      }
    },
    result: {
      data: {
        createPost: {
          id: "123abc",
          title: "Test Post",
          text: "Test Text",
          likes: 0,
          dislikes: 0,
          amountOfComments: 0,
          discussion: {
            id: "321cba",
            name: "Discussion Name"
          }
        }
      }
    }
  }

  //initialize the cache with a query that the CreatePostForm updates,
  //without this, there is nothing to update, and the update function fails
  const cache = new InMemoryCache()
  cache.writeQuery({
    query: GET_POSTS_BY_DISCUSSION,
    variables: { name: "Discussion Name" },
    data: { findPostsByDiscussion: [] }
  })

  render(
    <MockedProvider mocks={[createPostMock]} cache={cache}>
      <MemoryRouter>
        <CreatePostForm discussionName="Discussion Name" />
      </MemoryRouter>
    </MockedProvider>
  )

  userEvent.type(screen.getByPlaceholderText('Title'), "Test Post")
  userEvent.type(screen.getByPlaceholderText('Write your post here'), "Test Text")
  userEvent.click(screen.getByText('Create Post'))

  await wait()

  const { findPostsByDiscussion: data } = cache.readQuery({ query: GET_POSTS_BY_DISCUSSION, variables: { name: "Discussion Name" } })

  //remove discussion property of the object, as it is not returned from the cache and won't match
  delete createPostMock.result.data.createPost.discussion

  expect(data[0]).toEqual(createPostMock.result.data.createPost)
})