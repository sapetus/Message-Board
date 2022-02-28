import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { MemoryRouter } from 'react-router-dom'
import { InMemoryCache } from '@apollo/client'
import userEvent from '@testing-library/user-event'

import MessagePage from './MessagePage'
import { USER_MESSAGES, GET_CURRENT_USER } from '../GraphQL/queries'
import { DELETE_ALL_MESSAGES_FOR_USER } from '../GraphQL/mutations'

const getCurrentUserMock = {
  request: {
    query: GET_CURRENT_USER
  },
  result: {
    data: {
      getCurrentUser: {
        id: "xyz",
        username: "username"
      }
    }
  }
}

const userMessagesMock = {
  request: {
    query: USER_MESSAGES,
    variables: {
      username: "username",
      first: 5
    }
  },
  result: {
    data: {
      userMessages: [
        {
          id: "1",
          user: {
            id: "11",
            username: "username1"
          },
          comment: {
            id: "111",
            text: "comment text",
            post: {
              id: "1111",

            }
          },
          post: null
        },
        {
          id: "2",
          user: {
            id: "22",
            username: "username2"
          },
          comment: null,
          post: {
            id: "222",
            title: "post title"
          }
        }
      ]
    }
  }
}

const deleteAllMessagesMock = {
  request: {
    query: DELETE_ALL_MESSAGES_FOR_USER,
    variables: {
      username: "username"
    }
  },
  result: {
    data: {
      deleteAllMessagesForUser: 2
    }
  }
}

const wait = async (time = 0) => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, time))
  })
}

describe('renders properly', () => {
  test('when loading', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <MemoryRouter>
          <MessagePage />
        </MemoryRouter>
      </MockedProvider>
    )

    expect(screen.getByText('Loading...')).toBeDefined()
  })

  test('when no token is provided', async () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <MemoryRouter>
          <MessagePage />
        </MemoryRouter>
      </MockedProvider>
    )

    await wait()

    expect(screen.getByText(`Sorry, can't view this page`)).toBeDefined()
  })

  test('when token is provided and data is fetched', async () => {
    localStorage.setItem("username", "username")

    render(
      <MockedProvider mocks={[getCurrentUserMock, userMessagesMock]} addTypename={false}>
        <MemoryRouter>
          <MessagePage token="It's-a me, Mario!" />
        </MemoryRouter>
      </MockedProvider>
    )

    await wait(500)

    expect(screen.getAllByText(/commented your/).length).toEqual(2)
  })
})

describe('functionality', () => {
  test('all messages can be deleted', async () => {
    localStorage.setItem('username', "username")

    //slightly different version of than in index.js (doesn't filter copies)
    const mergeFunction = (existing, incoming, after, filter) => {
      let merged = existing ? existing.slice(0) : []

      //with this, only the filtered items are shown
      if (filter !== '' && after === 0) {
        merged = incoming
      } else {
        for (let i = 0; i < incoming.length; i++) {
          merged[after + i] = incoming[i]
        }
      }

      return merged
    }

    const cache = new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            userMessages: {
              keyArgs: ["username"],
              merge(existing, incoming, { args: { after = 0 } }) {
                return mergeFunction(existing, incoming, after)
              }
            }
          }
        }
      }
    })

    cache.writeQuery({
      query: USER_MESSAGES,
      variables: { username: "username" },
      data: { userMessages: [] }
    })

    render(
      <MockedProvider mocks={[getCurrentUserMock, userMessagesMock, deleteAllMessagesMock]} cache={cache}>
        <MemoryRouter>
          <MessagePage token="It's-a me, Mario!" />
        </MemoryRouter>
      </MockedProvider>
    )

    await wait(500)
    expect(screen.getAllByText(/commented your/).length).toEqual(2)

    userEvent.click(screen.getByText('Delete All'))

    await wait()
    expect(screen.queryByText(/commented your/)).toBeNull()
  })
})

afterAll(() => {
  localStorage.clear()
})