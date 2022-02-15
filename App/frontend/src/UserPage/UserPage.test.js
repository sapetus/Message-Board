import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { MockedProvider } from '@apollo/client/testing'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { GET_USER_BY_NAME } from '../GraphQL/queries'
import UserPage from './UserPage'

describe('Query', () => {
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
})

describe('Buttons', () => {
  test(`On first render Post button is selected`, () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <UserPage />
      </MockedProvider>
    )

    expect(getComputedStyle(screen.getByText('Posts')).backgroundColor)
      .toEqual('rgb(140, 84, 243)')
    expect(getComputedStyle(screen.getByText('Comments')).backgroundColor)
      .toEqual('transparent')
    expect(getComputedStyle(screen.getByText('Subscriptions')).backgroundColor)
      .toEqual('transparent')
  })

  test(`When Comments button is clicked, it's color is changed`, async () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <UserPage />
      </MockedProvider>
    )

    userEvent.click(screen.getByText('Comments'))

    await waitFor(() => {
      expect(getComputedStyle(screen.getByText('Comments')).backgroundColor)
        .toEqual('rgb(140, 84, 243)')
    })
    await waitFor(() => {
      expect(getComputedStyle(screen.getByText('Posts')).backgroundColor)
        .toEqual('transparent')
    })
    await waitFor(() => {
      expect(getComputedStyle(screen.getByText('Subscriptions')).backgroundColor)
        .toEqual('transparent')
    })
  })

  test(`When Subscriptions button is clicked, it's color is changed`, async () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <UserPage />
      </MockedProvider>
    )

    userEvent.click(screen.getByText('Subscriptions'))

    await waitFor(() => {
      expect(getComputedStyle(screen.getByText('Subscriptions')).backgroundColor)
        .toEqual('rgb(140, 84, 243)')
    })
    await waitFor(() => {
      expect(getComputedStyle(screen.getByText('Posts')).backgroundColor)
        .toEqual('transparent')
    })
    await waitFor(() => {
      expect(getComputedStyle(screen.getByText('Comments')).backgroundColor)
        .toEqual('transparent')
    })
  })
})