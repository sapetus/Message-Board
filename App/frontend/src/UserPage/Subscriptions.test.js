import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { MockedProvider } from '@apollo/client/testing'
import { MemoryRouter } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'

import Subscriptions from './Subscriptions'
import { GET_DISCUSSIONS_USER_SUBSCRIBED_TO } from '../GraphQL/queries'

test('renders properly', async () => {
  const userSubscriptionsMock = {
    request: {
      query: GET_DISCUSSIONS_USER_SUBSCRIBED_TO,
      variables: {
        username: "TestUser",
        first: 5,
        order: 'ALPHABETICAL'
      }
    },
    result: {
      data: {
        findDiscussionsUserHasSubscribedTo: [
          {
            id: "123abc",
            name: "Subscription Example",
            members: 10
          }
        ]
      }
    }
  }

  render(
    <MockedProvider mocks={[userSubscriptionsMock]} addTypename={false}>
      <MemoryRouter>
        <Subscriptions username={"TestUser"} amountToFetch={5} />
      </MemoryRouter>
    </MockedProvider>
  )

  await waitFor(() => {
    expect(screen.getByText('Subscription Example')).toBeDefined()
  })
})