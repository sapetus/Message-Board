const supertest = require('supertest')
const mongoose = require('mongoose')

const { app } = require('../app')
const Discussion = require('../models/Discussion')
const Comment = require('../models/Comment')
const Post = require('../models/Post')
const User = require('../models/User')
const helper = require('./testHelper')

const api = supertest(app)

describe('Discussion', () => {
  let helperData = null

  beforeEach(async () => {
    helperData = await helper.initializeDatabase()
  })

  describe('Queries', () => {
    test('return all discussions', async () => {
      const data = {
        query: `
          query allDiscussions {
            allDiscussions {
              id
              name
              members
            }
          }
        `,
        operationName: 'allDiscussions'
      }

      const response = await api
        .post('/graphql')
        .send(data)
        .expect(200)

      expect(response.body.data.allDiscussions).toHaveLength(helper.initialDiscussions.length)
    })

    test('specific discussion is returned', async () => {
      const data = {
        query: `
          query findDiscussion($name: String!) {
            findDiscussion(name: $name) {
              id
              name
              members
            }
          }
        `,
        operationName: 'findDiscussion',
        variables: {
          "name": "Movies"
        }
      }

      await api
        .post('/graphql')
        .send(data)
        .expect(200)
    })

    test('discussions user has subscribed to are returned', async () => {
      await Discussion.findOneAndUpdate(
        { _id: helperData.discussions[0].id },
        { listOfMembers: [helperData.users[0].id] },
        { new: true }
      )
      await User.findOneAndUpdate(
        { _id: helperData.users[0].id },
        { memberOf: [helperData.discussions[0].id] },
        { new: true }
      )

      const data = {
        query: `
          query findDiscussionsUserHasSubscribedTo($username: String!) {
            findDiscussionsUserHasSubscribedTo(username: $username) {
              id
              name
              members
            }
          }
        `,
        operationName: 'findDiscussionsUserHasSubscribedTo',
        variables: {
          "username": "movieFan"
        }
      }

      const response = await api
        .post('/graphql')
        .send(data)
        .expect(200)

      const discussions = response.body.data.findDiscussionsUserHasSubscribedTo

      expect(discussions).toHaveLength(1)
      expect(discussions[0].name).toEqual(helper.initialDiscussions[0].name)
    })
  })

  describe('Mutations', () => {

  })
})

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
  })

  describe('Mutations', () => {
  })
})

afterAll(() => {
  mongoose.connection.close()
})