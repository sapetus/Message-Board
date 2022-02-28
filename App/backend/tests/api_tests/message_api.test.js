const supertest = require('supertest')
const mongoose = require('mongoose')

const { app } = require('../../app')
const helper = require('../testHelper')

const api = supertest(app)

describe('Message', () => {
  let helperData = null

  beforeEach(async () => {
    helperData = await helper.initializeDatabase()
  })

  describe('Queries', () => {
    const queries = {
      messagesAmount: `
        query UserMessagesAmount($username: String!) {
          userMessagesAmount(username: $username)
        }
      `,
      userMessages: `
        query UserMessages($username: String!, $first: Int, $after: Int) {
          userMessages(username: $username, first: $first, after: $after) {
            id
            user {
              id
              username
            }
            comment {
              id
              text
              post {
                id
              }
            }
            post {
              id
              title
            }
          }
        }
      `
    }

    test('user has the correct amount of messages', async () => {
      const data = {
        query: queries.messagesAmount,
        operationName: "UserMessagesAmount",
        variables: { "username": helper.initialUsers[0].username }
      }

      const response = await api
        .post('/graphql')
        .send(data)
        .expect(200)

      expect(response.body.data.userMessagesAmount).toEqual(helper.initialMessages.length)
    })

    test('user has the right messages', async () => {
      const data = {
        query: queries.userMessages,
        operationName: "UserMessages",
        variables: { "username": helper.initialUsers[0].username }
      }

      const response = await api
        .post('/graphql')
        .send(data)
        .expect(200)

      expect(response.body.data.userMessages[1].comment.id).toEqual(helperData.comments[0].id)
      expect(response.body.data.userMessages[0].post.id).toEqual(helperData.posts[0].id)
    })
  })

  describe('Mutations', () => {
    const mutations = {
      createMessage: `
        mutation CreateMessage($userId: ID!, $commentId: ID, $postId: ID) {
          createMessage(userId: $userId, commentId: $commentId, postId: $postId) {
            id
          }
        }
      `,
      deleteMessage: `
        mutation DeleteMessage($id: ID!) {
          deleteMessage(id: $id) {
            id
          }
        }
      `,
      deleteAllMessagesForUser: `
        mutation DeleteAllMessagesForUser($username: String!) {
          deleteAllMessagesForUser(username: $username)
        }
      `,
      messageAcknowledged: `
        mutation MessageAcknowledged($id: ID!) {
          messageAcknowledged(id: $id) {
            id
          }
        }
      `
    }

    // test('message can be created', async () => {

    // })

    test('dummy test', () => {
      expect(true).toEqual(true)
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})