import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { MockedProvider } from '@apollo/client/testing'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import userEvent from '@testing-library/user-event'

import { FIND_POST, FIND_COMMENTS_BY_POST } from '../GraphQL/queries'
import PostPage from './PostPage'
import { InMemoryCache } from '@apollo/client'

const postMock = {
  request: {
    query: FIND_POST,
    variables: { id: "123abc" }
  },
  result: {
    data: {
      findPost: {
        id: "123abc",
        title: "Test Title",
        text: "Test Text",
        likes: 10,
        dislikes: 9,
        amountOfComments: 8,
        image: null,
        listOfLikeUsers: [],
        listOfDislikeUsers: [],
        user: {
          id: "aabbcc112233",
          username: "TestUser"
        },
        discussion: {
          name: "Test Discussion"
        }
      }
    }
  }
}

const commentsMock = {
  request: {
    query: FIND_COMMENTS_BY_POST,
    variables: {
      id: "123abc",
      first: 5,
      order: "NEW"
    }
  },
  result: {
    data: {
      findCommentsByPost: [
        {
          id: "1",
          text: "text1",
          likes: 0,
          dislikes: 0,
          user: {
            id: "userId1",
            username: "TestUser1"
          },
          responseTo: null,
          listOfLikeUsers: [],
          listOfDislikeUsers: []
        },
        {
          id: "2",
          text: "text2",
          likes: 0,
          dislikes: 0,
          user: {
            id: "userId2",
            username: "TestUser2"
          },
          responseTo: null,
          listOfLikeUsers: [],
          listOfDislikeUsers: []
        },
        {
          id: "3",
          text: "text3",
          likes: 0,
          dislikes: 0,
          user: {
            id: "userId3",
            username: "TestUser3"
          },
          responseTo: null,
          listOfLikeUsers: [],
          listOfDislikeUsers: []
        },
        {
          id: "4",
          text: "text4",
          likes: 0,
          dislikes: 0,
          user: {
            id: "userId4",
            username: "TestUser4"
          },
          responseTo: null,
          listOfLikeUsers: [],
          listOfDislikeUsers: []
        },
        {
          id: "5",
          text: "text5",
          likes: 0,
          dislikes: 0,
          user: {
            id: "userId5",
            username: "TestUser5"
          },
          responseTo: null,
          listOfLikeUsers: [],
          listOfDislikeUsers: []
        }
      ]
    }
  }
}

const fetchMoreMock = {
  request: {
    query: FIND_COMMENTS_BY_POST,
    variables: {
      id: "123abc",
      first: 5,
      after: 5,
      order: "NEW"
    }
  },
  result: {
    data: {
      findCommentsByPost: [
        {
          id: "6",
          text: "text6",
          likes: 0,
          dislikes: 0,
          user: {
            id: "userId6",
            username: "TestUser6"
          },
          responseTo: null,
          listOfLikeUsers: [],
          listOfDislikeUsers: []
        }
      ]
    }
  }
}

test('renders properly', async () => {
  render(
    <MockedProvider mocks={[postMock]} cache={new InMemoryCache()}>
      <MemoryRouter initialEntries={["/post/123abc"]}>
        <Routes>
          <Route path={"/post/:id"} element={<PostPage />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>,
    {
      route: "/post/123abc"
    }
  )

  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0))
  })

  expect(screen.getByText('Test Discussion')).toBeDefined()
  expect(screen.getByText('Post by TestUser')).toBeDefined()
  expect(screen.getByText('Test Title')).toBeDefined()
  expect(screen.getByText('Test Text')).toBeDefined()
})

describe('Functionality', () => {
  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          findCommentsByPost: {
            keyArgs: ["id"],
            merge(existing, incoming, { args: { after = 0 } }) {
              return mergeFunction(existing, incoming, after)
            }
          }
        }
      },
      Comment: {
        fields: {
          listOfLikeUsers: {
            merge(existing, incoming) {
              return incoming
            }
          },
          listOfDislikeUsers: {
            merge(existing, incoming) {
              return incoming
            }
          }
        }
      }
    }
  })

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

  test('Show more button works', async () => {
    render(
      <MockedProvider mocks={[postMock, fetchMoreMock, commentsMock]} cache={cache}>
        <MemoryRouter initialEntries={["/post/123abc"]}>
          <Routes>
            <Route path={"/post/:id"} element={<PostPage />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>,
      {
        route: "/post/123abc"
      }
    )

    //wait for a while so data is loaded onto the page
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    userEvent.click(screen.getByText('Show More'))

    //wait for a while so data is loaded onto the page
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    //this will only be true when all of the mock queries are successful
    expect(screen.getByText(/TestUser6/)).toBeDefined()
  })

  test('Show less button works', async () => {
    render(
      <MockedProvider mocks={[postMock, fetchMoreMock, commentsMock]} cache={cache}>
        <MemoryRouter initialEntries={["/post/123abc"]}>
          <Routes>
            <Route path={"/post/:id"} element={<PostPage />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>,
      {
        route: "/post/123abc"
      }
    )

    //wait for a while so data is loaded onto the page
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    //more posts need to be fetched before some posts can be hidden
    userEvent.click(screen.getByText('Show More'))

    //wait for a while so data is loaded onto the page
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    userEvent.click(screen.getByText('Show Less'))

    //wait for a while so data is loaded onto the page
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(screen.queryByText(/TestUser6/)).toBeNull()
    expect(screen.getByText(/TestUser5/)).toBeDefined()
  })

  test('Changing order works', async () => {
    const orderMock = {
      request: {
        query: FIND_COMMENTS_BY_POST,
        variables: {
          id: "123abc",
          first: 5,
          after: 0,
          order: "DISLIKES"
        }
      },
      result: {
        data: {
          findCommentsByPost: [
            {
              id: "7",
              text: "text7",
              likes: 0,
              dislikes: 0,
              user: {
                id: "userId7",
                username: "TestUser7"
              },
              responseTo: null,
              listOfLikeUsers: [],
              listOfDislikeUsers: []
            }
          ]
        }
      }
    }

    render(
      <MockedProvider mocks={[postMock, orderMock, commentsMock]} cache={cache}>
        <MemoryRouter initialEntries={["/post/123abc"]}>
          <Routes>
            <Route path={"/post/:id"} element={<PostPage />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>,
      {
        route: "/post/123abc"
      }
    )

    //wait for a while so data is loaded onto the page
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    userEvent.selectOptions(screen.getByRole('combobox'), ['DISLIKES'])

    //wait for a while so data is loaded onto the page
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(screen.getByRole('option', { name: "New Comments" }).selected).toBe(false)
    expect(screen.getByRole('option', { name: "Most Dislikes" }).selected).toBe(true)
  })
})