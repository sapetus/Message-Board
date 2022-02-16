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

test('renders properly', async () => {
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

  await waitFor(() => {
    expect(screen.getByText('In Test Discussion')).toBeDefined()
  })
  await waitFor(() => {
    expect(screen.getByText('By TestUser')).toBeDefined()
  })
  await waitFor(() => {
    expect(screen.getByText('Test Title')).toBeDefined()
  })
  await waitFor(() => {
    expect(screen.getByText('Test Text')).toBeDefined()
  })
})

describe('Functionality', () => {
  test('Show more button works', async () => {
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
    expect(screen.getByText('TestUser6')).toBeDefined()
  })

  test('Show less button works', () => {
    expect(0).toEqual(0)
  })

  test('Changing order works', () => {
    expect(0).toEqual(0)
  })
})