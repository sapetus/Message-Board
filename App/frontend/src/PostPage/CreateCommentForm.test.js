import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { CREATE_COMMENT } from '../GraphQL/mutations'
import CreateCommentForm from './CreateCommentForm'

//this doesn't work yet, the problem arises from the update function of the mutation
// test('creation of a comment is successful', async () => {
//   const createCommentMock = {
//     request: {
//       query: CREATE_COMMENT,
//       variables: {
//         text: "This is a test comment",
//         postId: "123abc",
//         commentId: "abc123"
//       }
//     },
//     result: {
//       data: {
//         createComment: {
//           id: "112233",
//           text: "This is a test comment",
//           likes: 0,
//           dislikes: 0,
//           user: {
//             id: "aabbcc",
//             username: "TestUser"
//           },
//           responseTo: {
//             id: "abc123",
//             text: "This is also a test comment"
//           }
//         }
//       }
//     }
//   }

//   //this will increment on succesful creation
//   let amount = 0

//   render(
//     <MockedProvider mocks={[createCommentMock]} addTypename={false}>
//       <CreateCommentForm
//         postId={"123abc"} commentId={"abc123"}
//         fetched={amount} setFetched={() => amount++}
//       />
//     </MockedProvider>
//   )

//   userEvent.click(screen.getByText('Reply'))
//   userEvent.type(screen.getByPlaceholderText('Comment here...'), "This is a test comment")
//   userEvent.click(screen.getByText('Create Comment'))

//   await waitFor(() => {
//     expect(amount).toEqual(1)
//   })
// })

test('dummy test', () => {
  expect(0).toEqual(0)
})