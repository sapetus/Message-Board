const supertest = require('supertest')
const mongoose = require('mongoose')

const { app } = require('../../app')
const helper = require('../testHelper')

const api = supertest(app)

describe('User', () => {
  let helperData = null

  beforeEach(async () => {
    helperData = await helper.initializeDatabase()
  })

  describe('Queries', () => {
    test('get logged in user', async () => {
      const token = await helper.createToken(0)

      const data = {
        query: `
          query getCurrentUser {
            getCurrentUser {
              id
              username
            }
          }
        `,
        operationName: "getCurrentUser"
      }

      const response = await api
        .post('/graphql')
        .set({ 'Authorization': token })
        .send(data)
        .expect(200)

      const user = response.body.data.getCurrentUser

      expect(user).not.toBeFalsy()
      expect(user.username).toEqual(helper.initialUsers[0].username)
    })

    test('get user by name', async () => {
      const data = {
        query: `
          query getUserByName($username: String!) {
            getUserByName(username: $username) {
              id
              username
              totalLikes
              totalDislikes
              creationDate
            }
          }
        `,
        operationName: "getUserByName",
        variables: {
          "username": helper.initialUsers[0].username
        }
      }

      const response = await api
        .post('/graphql')
        .send(data)
        .expect(200)

      const user = response.body.data.getUserByName

      expect(user.username).toBe(helper.initialUsers[0].username)
      expect(user.creationDate).toBe(helper.initialUsers[0].creationDate)
    })
  })

  describe('Mutations', () => {

  })
})

afterAll(() => {
  mongoose.connection.close()
})