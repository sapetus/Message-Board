import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import userEvent from '@testing-library/user-event'

import VoteButtons from './VoteButtons'

const wait = async (time = 0) => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, time))
  })
}

describe('render', () => {
  test("correctly when no token is provided", () => {
    render(
      <MockedProvider>
        <VoteButtons likes={10} dislikes={9} />
      </MockedProvider>
    )

    expect(screen.getByText('thumb_up')).toBeDefined()
    expect(screen.getByText('thumb_down')).toBeDefined()
  })

  test("correctly with token", () => {
    render(
      <MockedProvider>
        <VoteButtons
          token="C6H12O6"
          likes={10} dislikes={9}
          hasLiked={false} hasDisliked={false}
        />
      </MockedProvider>
    )

    expect(screen.getByText(10)).toBeDefined()
    expect(screen.getByText(9)).toBeDefined()
  })
})

describe('functionality', () => {
  test('like button works', async () => {
    const mockFunction = jest.fn()

    render(
      <MockedProvider>
        <VoteButtons
          token="WinnieThePooh"
          likes={10} dislikes={9}
          hasLiked={false} hasDisliked={false}
          likeFunction={mockFunction}
        />
      </MockedProvider>
    )
    await wait()

    userEvent.click(screen.getByText('thumb_up'))

    expect(mockFunction.mock.calls.length).toEqual(1)
  })

  test('unlike button works', async () => {
    const mockFunction = jest.fn()

    render(
      <MockedProvider>
        <VoteButtons
          token="WinnieThePooh"
          likes={10} dislikes={9}
          hasLiked={true} hasDisliked={false}
          unlikeFunction={mockFunction}
        />
      </MockedProvider>
    )
    await wait()

    userEvent.click(screen.getByText('thumb_up'))

    expect(mockFunction.mock.calls.length).toEqual(1)
  })

  test('dislikes button works', async () => {
    const mockFunction = jest.fn()

    render(
      <MockedProvider>
        <VoteButtons
          token="WinnieThePooh"
          likes={10} dislikes={9}
          hasLiked={false} hasDisliked={false}
          dislikeFunction={mockFunction}
        />
      </MockedProvider>
    )
    await wait()

    userEvent.click(screen.getByText('thumb_down'))

    expect(mockFunction.mock.calls.length).toEqual(1)
  })

  test('undislike button works', async () => {
    const mockFunction = jest.fn()

    render(
      <MockedProvider>
        <VoteButtons
          token="WinnieThePooh"
          likes={10} dislikes={9}
          hasLiked={false} hasDisliked={true}
          undislikeFunction={mockFunction}
        />
      </MockedProvider>
    )
    await wait()

    userEvent.click(screen.getByText('thumb_down'))

    expect(mockFunction.mock.calls.length).toEqual(1)
  }) 
})