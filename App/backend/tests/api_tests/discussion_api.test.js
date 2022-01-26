const supertest = require('supertest')
const mongoose = require('mongoose')

const { app } = require('../../app')
const Discussion = require('../../models/Discussion')
const User = require('../../models/User')
const helper = require('../testHelper')

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
    test('creating a discussion works', async () => {
      const token = await helper.createToken(0)

      const data = {
        query: `
          mutation createDiscussion($name: String!) {
            createDiscussion(name: $name) {
              id
              name
              members
            }
          }
        `,
        operationName: "createDiscussion",
        variables: {
          name: "Pets"
        }
      }

      const response = await api
        .post('/graphql')
        .set({ 'Authorization': token })
        .send(data)
        .expect(200)

      const discussion = response.body.data.createDiscussion

      //if creation was succesfull, the new discussion was returned
      expect(discussion).not.toBeFalsy()

      const discussionCount = await Discussion.count({})
      expect(discussionCount).toEqual(3)
    })

    test('subscribing to a discussion works', async () => {
      const token = await helper.createToken(0)

      const data = {
        query: `
          mutation subscribeToDiscussion($discussionName: String!) {
            subscribeToDiscussion(discussionName: $discussionName) {
              id
              members
            }
          }
        `,
        operationName: "subscribeToDiscussion",
        variables: {
          "discussionName": "Movies"
        }
      }

      const response = await api
        .post('/graphql')
        .set({ 'Authorization': token })
        .send(data)
        .expect(200)

      const discussion = response.body.data.subscribeToDiscussion

      //if subscription was succesfull, the updated discussion is returned
      expect(discussion.id).not.toBeFalsy()
      expect(discussion.members).toEqual(1)
    })

    test('unsubscribing from a discussion works', async () => {
      const token = await helper.createToken(1)

      const data = {
        query: `
          mutation unsubscribeFromDiscussion($discussionName: String!) {
            unsubscribeFromDiscussion(discussionName: $discussionName) {
              id
              members
            }
          }
        `,
        operationName: "unsubscribeFromDiscussion",
        variables: {
          "discussionName": "Books"
        }
      }

      const response = await api
        .post('/graphql')
        .set({ 'Authorization': token })
        .send(data)
        .expect(200)

      const discussion = response.body.data.unsubscribeFromDiscussion

      //if unsubscribing was sucessful, the updated discussion was returned
      expect(discussion.id).not.toBeFalsy()
      expect(discussion.members).toEqual(0)
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})