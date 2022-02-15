import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { MockedProvider } from '@apollo/client/testing'
import { MemoryRouter } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { LOG_IN } from '../GraphQL/mutations'
import LogInForm from './LogInForm'

test('log in of user works', async () => {
  const logInUserMock = {
    request: {
      query: LOG_IN,
      variables: {
        username: "TestUser",
        password: "TestPassword"
      }
    },
    result: {
      data: {
        login: {
          value: "123abc"
        }
      }
    }
  }

  //this value will change to "123abc" if mutation was successful
  let mutationToken = null

  render(
    <MockedProvider mocks={[logInUserMock]} addTypename={false}>
      <MemoryRouter>
        <LogInForm
          setToken={(token) => mutationToken = token}
          setMessage={(message) => console.log(message)}
        />
      </MemoryRouter>
    </MockedProvider>
  )

  userEvent.type(screen.getByPlaceholderText('Username'), "TestUser")
  userEvent.type(screen.getByPlaceholderText('Password'), "TestPassword")
  userEvent.click(screen.getByText('Log In'))

  await waitFor(() => {
    expect(mutationToken).toEqual('123abc')
  })
})