import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'

import Discussion from './Discussion'

test('renders content', () => {
  const discussion = {
    name: "Example Name",
    description: "Example Description",
    members: 100
  }

  render(
    <MemoryRouter>
      <Discussion discussion={discussion} />
    </MemoryRouter>
  )

  const nameElement = screen.getByText(discussion.name)
  expect(nameElement).toBeDefined()

  const descriptionElement = screen.getByText(discussion.description)
  expect(descriptionElement).toBeDefined()

  const membersElement = screen.getByText(discussion.members)
  expect(membersElement).toBeDefined()
})