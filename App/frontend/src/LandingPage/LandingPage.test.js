import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InMemoryCache } from '@apollo/client'
import { act } from 'react-dom/test-utils'
import { MemoryRouter } from 'react-router-dom'

import { ALL_DISCUSSIONS } from '../GraphQL/queries'
import LandingPage from './LandingPage'

const discussionsMock = {
  request: {
    query: ALL_DISCUSSIONS,
    variables: {
      first: 5,
      order: "NEW",
      filter: ""
    }
  },
  result: {
    data: {
      allDiscussions: [
        {
          id: "1",
          name: "Test Discussion 1",
          description: "Discussion 1 Description",
          members: 1
        },
        {
          id: "2",
          name: "Test Discussion 2",
          description: "Discussion 2 Description",
          members: 2
        },
        {
          id: "3",
          name: "Test Discussion 3",
          description: "Discussion 3 Description",
          members: 3
        },
        {
          id: "4",
          name: "Test Discussion 4",
          description: "Discussion 4 Description",
          members: 4
        },
        {
          id: "5",
          name: "Test Discussion 5",
          description: "Discussion 5 Description",
          members: 5
        }
      ]
    }
  }
}

const fetchMoreMock = {
  request: {
    query: ALL_DISCUSSIONS,
    variables: {
      first: 5,
      after: 5,
      order: "NEW",
      filter: ""
    }
  },
  result: {
    data: {
      allDiscussions: [
        {
          id: "6",
          name: "Test Discussion 6",
          description: "Discussion 6 Description",
          members: 6
        }
      ]
    }
  }
}

const changeOrderMock = {
  request: {
    query: ALL_DISCUSSIONS,
    variables: {
      first: 5,
      after: 0,
      order: "MEMBERS",
      filter: ""
    }
  },
  result: {
    data: {
      allDiscussions: [
        {
          id: "5",
          name: "Test Discussion 5",
          description: "Discussion 5 Description",
          members: 5
        },
        {
          id: "4",
          name: "Test Discussion 4",
          description: "Discussion 4 Description",
          members: 4
        },
        {
          id: "3",
          name: "Test Discussion 3",
          description: "Discussion 3 Description",
          members: 3
        },
        {
          id: "2",
          name: "Test Discussion 2",
          description: "Discussion 2 Description",
          members: 2
        },
        {
          id: "1",
          name: "Test Discussion 1",
          description: "Discussion 1 Description",
          members: 1
        }
      ]
    }
  }
}

const searchMock = {
  request: {
    query: ALL_DISCUSSIONS,
    variables: {
      first: 5,
      order: "NEW",
      filter: "Test Discussion 5"
    }
  },
  result: {
    data: {
      allDiscussions: [
        {
          id: "5",
          name: "Test Discussion 5",
          description: "Discussion 5 Description",
          members: 5
        }
      ]
    }
  }
}

const wait = async (time = 0) => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, time))
  })
}

test('renders properly', async () => {
  render(
    <MockedProvider mocks={[discussionsMock]} addTypename={false}>
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    </MockedProvider>
  )

  await wait()

  expect(screen.getAllByText(/Test Discussion/)).toHaveLength(5)
})

describe('Functionality', () => {
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

  let cache = null;

  beforeEach(() => {
    cache = new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            allDiscussions: {
              keyArgs: [],
              merge(existing, incoming, { args: { after = 0, filter = '' } }) {
                return mergeFunction(existing, incoming, after, filter)
              }
            },
          }
        }
      }
    })
  })

  test('Show more button works', async () => {
    render(
      <MockedProvider mocks={[discussionsMock, fetchMoreMock]} cache={cache}>
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      </MockedProvider>
    )

    await wait()

    userEvent.click(screen.getByText('Show More'))

    await wait()

    expect(screen.getAllByText(/Test Discussion/)).toHaveLength(6)
  })

  test('Show less button works', async () => {
    render(
      <MockedProvider mocks={[discussionsMock, fetchMoreMock]} cache={cache}>
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      </MockedProvider>
    )
    await wait()

    userEvent.click(screen.getByText('Show More'))
    await wait()
    expect(screen.getAllByText(/Test Discussion/)).toHaveLength(6)

    userEvent.click(screen.getByText('Show Less'))
    await wait()
    expect(screen.getAllByText(/Test Discussion/)).toHaveLength(5)
  })

  test('Changing order works', async () => {
    render(
      <MockedProvider mocks={[discussionsMock, changeOrderMock]} cache={cache} >
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      </MockedProvider>
    )
    await wait()

    userEvent.selectOptions(screen.getByRole('combobox'), ["MEMBERS"])
    await wait()

    expect(screen.getByRole('option', { name: "New Discussions" }).selected).toBe(false)
    expect(screen.getByRole('option', { name: "Most Members" }).selected).toBe(true)
  })

  test('Search works', async () => {
    render(
      <MockedProvider mocks={[discussionsMock, searchMock]} cache={cache}>
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      </MockedProvider>
    )
    await wait()

    userEvent.type(screen.getByPlaceholderText('Search...'), "Test Discussion 5")
    await wait(1000)
    expect(screen.getAllByText(/Test Discussion/)).toHaveLength(1)
  })
})
