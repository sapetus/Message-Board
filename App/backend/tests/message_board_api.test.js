const supertest = require('supertest')
const mongoose = require('mongoose')

const { app } = require('../app')
const Discussion = require('../models/Discussion')

const api = supertest(app)

describe('test', () => {
  beforeEach(async () => {
    await Discussion.deleteMany({})

    const discussion = new Discussion({
      name: "Test Discussion",
      members: 0,
      posts: [],
      listOfMembers: []
    })

    try {
      await discussion.save()
    } catch (error) {
      console.log(error)
    }
  })

  test('test', async () => {
    const postData = {
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
      .send(postData)
      .expect(200)

    console.log(response.body.data.allDiscussions)
  })
})

afterAll(() => {
  mongoose.connection.close()
})