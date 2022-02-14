import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { MockedProvider } from '@apollo/client/testing'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'

import { GET_USER_BY_NAME } from '../GraphQL/queries'
import UserPage from './UserPage'

test('renders properly', async () => {
  const userMock = {
    request: {
      query: GET_USER_BY_NAME,
      variables: { username: "TestUser" }
    },
    result: {
      data: {
        getUserByName: {
          id: "abc123",
          username: "TestUser",
          totalLikes: 10,
          totalDislikes: 9,
          creationDate: "2022-02-14"
        }
      }
    }
  }

  render(
    <MockedProvider mocks={[userMock]} addTypename={false}>
      <MemoryRouter initialEntries={["/user/TestUser"]}>
        <Routes>
          <Route path={"/user/:username"} element={<UserPage />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider >,
    {
      route: '/user/TestUser'
    }
  )

  await waitFor(() => {
    expect(screen.getByText('TestUser')).toBeDefined()
  })
  await waitFor(() => {
    expect(screen.getByText('14.02.2022')).toBeDefined()
  })
})