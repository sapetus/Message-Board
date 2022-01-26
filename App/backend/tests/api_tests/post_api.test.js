const supertest = require('supertest')
const mongoose = require('mongoose')

const { app } = require('../../app')
const helper = require('../testHelper')

const api = supertest(app)

describe('Post', () => {
  let helperData = null

  beforeEach(async () => {
    helperData = await helper.initializeDatabase()
  })

  describe('Queries', () => {
    test('specific post is returned', async () => {
      const data = {
        query: `
          query findPost($id: ID!) {
            findPost(id: $id) {
              id
              title
              text
              likes
              dislikes
            }
          }
        `,
        operationName: 'findPost',
        variables: {
          "id": helperData.posts[0].id
        }
      }

      const response = await api
        .post('/graphql')
        .send(data)
        .expect(200)

      const post = response.body.data.findPost

      expect(post.title).toEqual(helper.initialPosts[0].title)
      expect(post.text).toEqual(helper.initialPosts[0].text)
    })

    test('posts by given user are returned', async () => {
      const data = {
        query: `
          query findPostsByUser($username: String!) {
            findPostsByUser(username: $username) {
              id
              title
              text
              likes
              dislikes
            }
          }
        `,
        operationName: "findPostsByUser",
        variables: {
          "username": helper.initialUsers[0].username
        }
      }

      const response = await api
        .post('/graphql')
        .send(data)
        .expect(200)

      const posts = response.body.data.findPostsByUser

      expect(posts).toHaveLength(1)
      expect(posts[0].text).toEqual(helper.initialPosts[0].text)
    })

    test('posts in given discussion are returned', async () => {
      const data = {
        query: `
          query findPostsByDiscussion($name: String!) {
            findPostsByDiscussion(name: $name) {
              id
              title
              text
              likes
              dislikes
            }
          }
        `,
        operationName: "findPostsByDiscussion",
        variables: {
          "name": helper.initialDiscussions[0].name
        }
      }

      const response = await api
        .post('/graphql')
        .send(data)
        .expect(200)

      const posts = response.body.data.findPostsByDiscussion

      expect(posts).toHaveLength(1)
      expect(posts[0].text).toEqual(helper.initialPosts[0].text)
    })
  })

  describe('Mutations', () => {

  })
})

afterAll(() => {
  mongoose.connection.close()
})