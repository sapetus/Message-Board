import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InMemoryCache } from '@apollo/client'
import { act } from 'react-dom/test-utils'
import { MemoryRouter } from 'react-router-dom'

import Posts from './Posts'
import { GET_POSTS_BY_DISCUSSION } from '../GraphQL/queries'

const wait = async (time = 0) => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, time))
  })
}

const postsMock = {
  request: {
    query: GET_POSTS_BY_DISCUSSION,
    variables: {
      name: "Discussion Name",
      first: 5,
      order: "NEW",
      filter: ""
    }
  },
  result: {
    data: {
      findPostsByDiscussion: [
        {
          id: "1",
          title: "Post Title 1",
          text: "Post Text 1",
          likes: 1,
          dislikes: 1,
          amountOfComments: 0
        },
        {
          id: "2",
          title: "Post Title 2",
          text: "Post Text 2",
          likes: 2,
          dislikes: 2,
          amountOfComments: 0
        },
        {
          id: "3",
          title: "Post Title 3",
          text: "Post Text 3",
          likes: 3,
          dislikes: 3,
          amountOfComments: 0
        },
        {
          id: "4",
          title: "Post Title 4",
          text: "Post Text 4",
          likes: 4,
          dislikes: 4,
          amountOfComments: 0
        },
        {
          id: "5",
          title: "Post Title 5",
          text: "Post Text 5",
          likes: 5,
          dislikes: 5,
          amountOfComments: 0
        }
      ]
    }
  }
}

const fetchMoreMock = {
  request: {
    query: GET_POSTS_BY_DISCUSSION,
    variables: {
      name: "Discussion Name",
      first: 5,
      after: 5,
      order: "NEW",
      filter: ""
    }
  },
  result: {
    data: {
      findPostsByDiscussion: [
        {
          id: "6",
          title: "Post Title 6",
          text: "Post Text 6",
          likes: 6,
          dislikes: 6,
          amountOfComments: 0
        }
      ]
    }
  }
}

const changeOrderMock = {
  request: {
    query: GET_POSTS_BY_DISCUSSION,
    variables: {
      name: "Discussion Name",
      first: 5,
      after: 0,
      order: "LIKES",
      filter: ""
    }
  },
  result: {
    data: {
      findPostsByDiscussion: [
        {
          id: "5",
          title: "Post Title 5",
          text: "Post Text 5",
          likes: 5,
          dislikes: 5,
          amountOfComments: 0
        },
        {
          id: "4",
          title: "Post Title 4",
          text: "Post Text 4",
          likes: 4,
          dislikes: 4,
          amountOfComments: 0
        },
        {
          id: "3",
          title: "Post Title 3",
          text: "Post Text 3",
          likes: 3,
          dislikes: 3,
          amountOfComments: 0
        },
        {
          id: "2",
          title: "Post Title 2",
          text: "Post Text 2",
          likes: 2,
          dislikes: 2,
          amountOfComments: 0
        },
        {
          id: "1",
          title: "Post Title 1",
          text: "Post Text 1",
          likes: 1,
          dislikes: 1,
          amountOfComments: 0
        }
      ]
    }
  }
}

const searchMock = {
  request: {
    query: GET_POSTS_BY_DISCUSSION,
    variables: {
      name: "Discussion Name",
      first: 5,
      order: "NEW",
      filter: "Post Title 1"
    }
  },
  result: {
    data: {
      findPostsByDiscussion: [
        {
          id: "1",
          title: "Post Title 1",
          text: "Post Text 1",
          likes: 1,
          dislikes: 1,
          amountOfComments: 0
        }
      ]
    }
  }
}

test('renders properly with data', async () => {
  render(
    <MockedProvider mocks={[postsMock]} addTypename={false}>
      <MemoryRouter>
        <Posts name="Discussion Name" />
      </MemoryRouter>
    </MockedProvider>
  )
  await wait()

  expect(screen.getAllByText(/Post Title/)).toHaveLength(5)
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
            findPostsByDiscussion: {
              keyArgs: ["name"],
              merge(existing, incoming, { args: { after = 0 } }) {
                return mergeFunction(existing, incoming, after)
              }
            }
          }
        }
      }
    })
  })

  test('Show more button works', async () => {
    render(
      <MockedProvider mocks={[postsMock, fetchMoreMock]} cache={cache}>
        <MemoryRouter>
          <Posts name="Discussion Name" />
        </MemoryRouter>
      </MockedProvider>
    )
    await wait()
    expect(screen.getAllByText(/Post Title/)).toHaveLength(5)

    userEvent.click(screen.getByText('Show More'))
    await wait()
    expect(screen.getAllByText(/Post Title/)).toHaveLength(6)
  })

  test('Show less button works', async () => {
    render(
      <MockedProvider mocks={[postsMock, fetchMoreMock]} cache={cache}>
        <MemoryRouter>
          <Posts name="Discussion Name" />
        </MemoryRouter>
      </MockedProvider>
    )
    await wait()
    expect(screen.getAllByText(/Post Title/)).toHaveLength(5)

    userEvent.click(screen.getByText('Show More'))
    await wait()
    expect(screen.getAllByText(/Post Title/)).toHaveLength(6)

    userEvent.click(screen.getByText('Show Less'))
    await wait()
    expect(screen.getAllByText(/Post Title/)).toHaveLength(5)
  })

  test('Changing order works', async () => {
    render(
      <MockedProvider mocks={[postsMock, changeOrderMock]} cache={cache}>
        <MemoryRouter>
          <Posts name="Discussion Name" />
        </MemoryRouter>
      </MockedProvider>
    )
    await wait()

    userEvent.selectOptions(screen.getByRole('combobox'), ['LIKES'])
    await wait()

    expect(screen.getByRole('option', { name: "Most Likes" }).selected).toBe(true)
    expect(screen.getByRole('option', { name: "New Posts" }).selected).toBe(false)
  })

  test('Search works', async () => {
    render(
      <MockedProvider mocks={[postsMock, searchMock]} cache={cache}>
        <MemoryRouter>
          <Posts name="Discussion Name" />
        </MemoryRouter>
      </MockedProvider>
    )
    await wait()

    userEvent.type(screen.getByPlaceholderText('Search...'), "Post Title 1")
    await wait(1000)
    expect(screen.getAllByText(/Post Title/)).toHaveLength(1)
  })
})