const supertest = require('supertest')
const mongoose = require('mongoose')

const { app } = require('../../app')
const helper = require('../testHelper')

const api = supertest(app)

describe('Comment', () => {
  let helperData = null

  beforeEach(async () => {
    helperData = await helper.initializeDatabase()
  })

  describe('Queries', () => {
    test('specific comment is returned', async () => {
      const data = {
        query: `
          query findComment($id: ID!) {
            findComment(id: $id) {
              id
              text
              likes
              dislikes
            }
          }
        `,
        operationName: "findComment",
        variables: {
          "id": helperData.comments[0].id
        }
      }

      const response = await api
        .post('/graphql')
        .send(data)
        .expect(200)

      const comment = response.body.data.findComment

      expect(comment.text).toEqual(helper.initialComments[0].text)
    })

    test('comments in given post are returned', async () => {
      const data = {
        query: `
          query findCommentsByPost($id: ID!) {
            findCommentsByPost(id: $id) {
              id
              text
              likes
              dislikes
            }
          }
        `,
        operationName: "findCommentsByPost",
        variables: {
          "id": helperData.posts[0].id
        }
      }

      const response = await api
        .post('/graphql')
        .send(data)
        .expect(200)

      const comments = response.body.data.findCommentsByPost

      expect(comments).toHaveLength(1)
      expect(comments[0].text).toEqual(helper.initialComments[0].text)
    })

    test('comments by given user are returned', async () => {
      const data = {
        query: `
          query findCommentsByUser($username: String!) {
            findCommentsByUser(username: $username) {
              id
              text
              likes
              dislikes
            }
          }
        `,
        operationName: "findCommentsByUser",
        variables: {
          "username": helperData.users[0].username
        }
      }

      const response = await api
        .post('/graphql')
        .send(data)
        .expect(200)

      const comments = response.body.data.findCommentsByUser

      expect(comments).toHaveLength(1)
      expect(comments[0].text).toEqual(helper.initialComments[1].text)
    })
  })

  describe('Mutations', () => {

  })
})

afterAll(() => {
  mongoose.connection.close()
})