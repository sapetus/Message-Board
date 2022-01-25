const supertest = require('supertest')
const mongoose = require('mongoose')

const { app } = require('../app')
const Discussion = require('../models/Discussion')
const Comment = require('../models/Comment')
const Post = require('../models/Post')
const User = require('../models/User')
const helper = require('./testHelper')

const api = supertest(app)

describe('Discussions', () => {
  beforeAll(async () => {
    await Discussion.deleteMany({})
    await Discussion.insertMany(helper.initialDiscussions)
  })

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
})

describe('Posts', () => {
  let posts = []

  beforeAll(async () => {
    await Post.deleteMany({})
    await Post.insertMany(helper.initialPosts)
    posts = await Post.find({})
  })

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
        "id": posts[0].id
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

afterAll(() => {
  mongoose.connection.close()
})