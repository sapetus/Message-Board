import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import DiscussionPage from './DiscussionPage'
import { FIND_DISCUSSION } from '../GraphQL/queries'

const wait = async (time = 0) => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, time))
  })
}

const discussionMock = {
  request: {
    query: FIND_DISCUSSION,
    variables: {
      name: "discussionName"
    }
  },
  result: {
    data: {
      findDiscussion: {
        id: "123abc",
        name: "discussionName",
        description: "Discussion Description",
        members: 0,
        posts: [],
        listOfMembers: []
      }
    }
  }
}

test('renders properly', async () => {
  render(
    <MockedProvider mocks={[discussionMock]} addTypename={false}>
      <MemoryRouter initialEntries={["/discussion/discussionName/"]}>
        <Routes>
          <Route path="/discussion/:name" element={<DiscussionPage />} />
        </Routes>
        <DiscussionPage />
      </MemoryRouter>
    </MockedProvider>,
    {
      route: "/discussion/discussionName"
    }
  )
  await wait()

  expect(screen.getByText('discussionName')).toBeDefined()
  expect(screen.getByText('Discussion Description')).toBeDefined()
})