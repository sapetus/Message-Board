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
        mutation CreateMessage($userId: ID!, $responderId: ID!, $commentId: ID, $postId: ID, $responseTo: String!) {
          createMessage(userId: $userId, responderId: $responderId, commentId: $commentId, postId: $postId, responseTo: $responseTo) {
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

    test('message can be created for post', async () => {
      const data = {
        query: mutations.createMessage,
        operationName: "CreateMessage",
        variables: {
          "userId": helperData.users[0].id,
          "responderId": helperData.users[1].id,
          "postId": helperData.posts[0].id,
          "responseTo": "POST"
        }
      }

      const response = await api
        .post('/graphql')
        .send(data)
        .expect(200)

      expect(response.body.data.createMessage).toHaveProperty("id")
    })

    test('message can be created for comment', async () => {
      const data = {
        query: mutations.createMessage,
        operationName: "CreateMessage",
        variables: {
          "userId": helperData.users[0].id,
          "responderId": helperData.users[1].id,
          "commentId": helperData.comments[0].id,
          "responseTo": "COMMENT"
        }
      }

      const response = await api
        .post('/graphql')
        .send(data)
        .expect(200)

      expect(response.body.data.createMessage).toHaveProperty("id")
    })

    test('deletion of a message works', async () => {
      const data = {
        query: mutations.deleteMessage,
        operationName: "DeleteMessage",
        variables: { "id": helperData.messages[0].id }
      }

      const response = await api
        .post('/graphql')
        .send(data)
        .expect(200)

      expect(response.body.data.deleteMessage).toHaveProperty('id')
    })

    test('delete all of users messages', async () => {
      const data = {
        query: mutations.deleteAllMessagesForUser,
        operationName: "DeleteAllMessagesForUser",
        variables: { "username": helperData.users[0].username }
      }

      const response = await api
        .post('/graphql')
        .send(data)
        .expect(200)

      expect(response.body.data.deleteAllMessagesForUser).toEqual(2)
    })

    test('acknowledge message', async () => {
      const data = {
        query: mutations.messageAcknowledged,
        operationName: "MessageAcknowledged",
        variables: { "id": helperData.messages[0].id }
      }

      const response = await api
        .post('/graphql')
        .send(data)
        .expect(200)

      expect(response.body.data.messageAcknowledged).toHaveProperty("id")
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})