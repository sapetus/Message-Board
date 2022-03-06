import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { MemoryRouter } from 'react-router-dom'
import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'

import Comment from './Comment'

test('renders content', () => {
  const comment = {
    id: "123abc",
    text: "Comment text",
    likes: 100,
    dislikes: 90,
    responseTo: {
      id: "abc123",
      text: "Response to text"
    },
    user: {
      id: "1a2b3c",
      username: "username"
    }
  }

  const mock = []

  render(
    <MockedProvider mocks={mock} addTypename={false}>
      <MemoryRouter>
        <Comment comment={comment} />
      </MemoryRouter>
    </MockedProvider>
  )

  const textElement = screen.getByText(comment.text)
  expect(textElement).toBeDefined()

  const responseElement = screen.getByText(`— ${comment.responseTo.text}`)
  expect(responseElement).toBeDefined()

  const authorElement = screen.getByText(/Comment by/)
  expect(authorElement).toBeDefined()
})