import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Modal from './Modal'

test('renders correctly', () => {
  render(
    <Modal text="example modal text" />
  )

  expect(screen.getByText('example modal text')).toBeDefined()
})

//modal closes when the text changes to null
test('modal can be closed', () => {
  const fn = jest.fn()

  render(
    <Modal text="example modal text" setMessage={fn} />
  )

  userEvent.click(screen.getByText('close'))

  expect(fn.mock.calls[0][0]).toBeNull()
})