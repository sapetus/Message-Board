const supertest = require('supertest')
const mongoose = require('mongoose')

const { app } = require('../../app')
const helper = require('../testHelper')
const User = require('../../models/User')

const api = supertest(app)

describe('User', () => {
  let helperData = null

  beforeEach(async () => {
    helperData = await helper.initializeDatabase()
  })

  describe('Queries', () => {
    const queries = {
      getCurrentUser: `
        query getCurrentUser {
          getCurrentUser {
            id
            username
          }
        }
      `,
      getUserByName: `
        query getUserByName($username: String!) {
          getUserByName(username: $username) {
            id
            username
            totalLikes
            totalDislikes
            creationDate
          }
        }
      `
    }

    test('get logged in user', async () => {
      const token = await helper.createToken(0)

      const data = {
        query: queries.getCurrentUser,
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
        query: queries.getUserByName,
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
    const queries = {
      createUser: `
        mutation createUser($username: String!, $password: String!) {
          createUser(username: $username, password: $password) {
            id
            username
          }
        }
      `,
      login: `
        mutation login($username: String!, $password: String!) {
          login(username: $username, password: $password) {
            value
          }
        }
      `
    }

    test('creating a user with valid data works', async () => {
      const data = {
        query: queries.createUser,
        operationName: "createUser",
        variables: {
          "username": "TestUser",
          "password": "TestPassword"
        }
      }

      const response = await api
        .post('/graphql')
        .send(data)
        .expect(200)

      const user = response.body.data.createUser

      expect(user).not.toBeFalsy()
      const userCount = await User.count({})
      expect(userCount).toEqual(4)
    })

    test('creating a user with invalid data doesnt work', async () => {
      const data = {
        query: queries.createUser,
        operationName: "createUser",
        variables: {
          "username": "TestUser",
          "invalid": "invalidData"
        }
      }

      const response = await api
        .post('/graphql')
        .send(data)
        .expect(400)

      expect(response.body.errors[0].message).toEqual(`Variable "$password" of required type "String!" was not provided.`)
    })

    test('Trying to create an user with already existing name doesnt work', async () => {
      const data = {
        query: queries.createUser,
        operationName: "createUser",
        variables: {
          "username": "movieFan",
          "password": "password"
        }
      }

      const response = await api
        .post('/graphql')
        .send(data)
        .expect(200)

      expect(response.body.errors[0].message).toContain(`expected \`username\` to be unique`)
    })

    test('login works with correct credentials', async () => {
      const data = {
        query: queries.login,
        operationName: "login",
        variables: {
          "username": "movieFan",
          "password": "password"
        }
      }

      const response = await api
        .post('/graphql')
        .send(data)
        .expect(200)

      const token = response.body.data.login.value
      expect(token).not.toBeFalsy()
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})