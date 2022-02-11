import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'

import Post from './Post'

test('renders content', () => {
  const post = {
    id: "abc123",
    title: "Example Title",
    text: "Example Text",
    likes: 100,
    dislikes: 90,
    amountOfComments: 80
  }

  render(
    <MemoryRouter>
      <Post post={post} />
    </MemoryRouter>
  )

  const titleElement = screen.getByText(post.title)
  expect(titleElement).toBeDefined()

  const textElement = screen.getByText(post.text)
  expect(textElement).toBeDefined()
})