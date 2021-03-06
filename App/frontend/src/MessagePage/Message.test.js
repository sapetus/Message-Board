import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { MemoryRouter } from 'react-router-dom'
import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InMemoryCache } from '@apollo/client'

import Message from './Message'
import { USER_MESSAGES } from '../GraphQL/queries'
import { DELETE_MESSAGE } from '../GraphQL/mutations'

describe('renders correctly', () => {
  test('when post is provided', () => {
    const message = {
      id: "1",
      user: {
        id: "2",
        username: "username"
      },
      responder: {
        id: "3",
        username: "username2"
      },
      post: {
        id: "4",
        title: "title",
        discussion: {
          name: "discussion"
        }
      },
      comment: {
        id: "5",
        text: "text", 
        post: {
          discussion: {
            name: "discussion"
          }
        }
      },
      seen: true
    }

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <MemoryRouter>
          <Message message={message} username="username" />
        </MemoryRouter>
      </MockedProvider>
    )

    expect(screen.getByText('username2 responded to your post in discussion')).toBeDefined()
  })

  test('when comment is provided', () => {
    const message = {
      id: "1",
      user: {
        id: "2",
        username: "username"
      },
      responder: {
        id: "3",
        username: "username2"
      },
      comment: {
        id: "4",
        text: "an example comment text",
        post: {
          id: "5",
          discussion: {
            name: "discussion"
          }
        }
      }
    }

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <MemoryRouter>
          <Message message={message} username="username" />
        </MemoryRouter>
      </MockedProvider>
    )

    expect(screen.getByText('username2 responded to your comment in discussion')).toBeDefined()
  })
})

test('deleting a message works', async () => {
  const message = {
    id: "1",
    user: {
      id: "2",
      username: "username"
    },
    responder: {
      id: "3",
      username: "username2"
    },
    post: {
      id: "4",
      title: "title",
      discussion: {
        name: "discussion"
      }
    },
    comment: {
      id: "5",
      text: "text",
      post: {
        id: "6",
        title: "another title",
        discussion: {
          name: "discussion"
        }
      }
    },
    seen: true
  }

  const deleteMessageMock = {
    request: {
      query: DELETE_MESSAGE,
      variables: {
        id: "1"
      }
    },
    result: {
      data: {
        deleteMessage: {
          id: "1"
        }
      }
    }
  }

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
    data: { userMessages: [{ ...message, __typename: "Message" }] }
  })

  render(
    <MockedProvider mocks={[deleteMessageMock]} cache={cache}>
      <MemoryRouter>
        <Message message={message} username="username" />
      </MemoryRouter>
    </MockedProvider>
  )

  await waitFor(async () => {
    await new Promise(resolve => setTimeout(resolve, 0))
  })

  userEvent.click(screen.getByText('Delete'))

  await waitFor(async () => {
    await new Promise(resolve => setTimeout(resolve, 0))
  })

  const dataInCache = cache.readQuery({
    query: USER_MESSAGES,
    variables: { username: "username" }
  })

  expect(dataInCache.userMessages).toEqual([])
})