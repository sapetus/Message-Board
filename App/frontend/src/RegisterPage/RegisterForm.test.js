import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { CREATE_USER } from '../GraphQL/mutations'
import RegisterForm from './RegisterForm'

test('creation of a user works', async () => {
  const createUserMock = {
    request: {
      query: CREATE_USER,
      variables: {
        username: "TestUser",
        password: "TestPassword"
      }
    },
    result: {
      data: {
        createUser: {
          username: "TestUser",
          id: "123abc"
        }
      }
    }
  }

  //this value will change depending on the result of the mutation
  let mutationMessage = null

  render(
    <MockedProvider mocks={[createUserMock]} addTypename={false}>
      <RegisterForm setMessage={(message) => mutationMessage = message} />
    </MockedProvider>
  )

  userEvent.type(screen.getByPlaceholderText('Username'), "TestUser")
  userEvent.type(screen.getByPlaceholderText('Password'), "TestPassword")
  userEvent.type(screen.getByPlaceholderText('Confirm Password'), "TestPassword")
  userEvent.click(screen.getByText('Register'))

  await waitFor(() => {
    expect(mutationMessage).toEqual('Registration successful')
  })
})