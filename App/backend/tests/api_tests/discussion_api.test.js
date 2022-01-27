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
    const queries = {
      allDiscussions: `
        query allDiscussions {
          allDiscussions {
            id
            name
            members
          }
        }
      `,
      findDiscussion: `
        query findDiscussion($name: String!) {
          findDiscussion(name: $name) {
            id
            name
            members
          }
        }
      `,
      findDiscussionsUserHasSubscribedTo: `
        query findDiscussionsUserHasSubscribedTo($username: String!) {
          findDiscussionsUserHasSubscribedTo(username: $username) {
            id
            name
            members
          }
        }
      `
    }

    test('return all discussions', async () => {
      const data = {
        query: queries.allDiscussions,
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
        query: queries.findDiscussion,
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
        query: queries.findDiscussionsUserHasSubscribedTo,
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
    const queries = {
      createDiscussion: `
        mutation createDiscussion($name: String!) {
          createDiscussion(name: $name) {
            id
            name
            members
          }
        }
      `,
      subscribeToDiscussion: `
        mutation subscribeToDiscussion($discussionName: String!) {
          subscribeToDiscussion(discussionName: $discussionName) {
            id
            members
          }
        }
      `,
      unsubscribeFromDiscussion: `
        mutation unsubscribeFromDiscussion($discussionName: String!) {
          unsubscribeFromDiscussion(discussionName: $discussionName) {
            id
            members
          }
        }
      `
    }

    test('creating a discussion with valid data works', async () => {
      const token = await helper.createToken(0)

      const data = {
        query: queries.createDiscussion,
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

    test('creating a discussion with invalid data doesnt work', async () => {
      const token = await helper.createToken(0)

      const data = {
        query: queries.createDiscussion,
        operationName: "createDiscussion",
        variables: {
          "invalid": "invalid"
        }
      }

      const response = await api
        .post('/graphql')
        .set({ 'Authorization': token })
        .send(data)
        .expect(400)

      expect(response.body.errors[0].message)
        .toEqual(`Variable "$name" of required type "String!" was not provided.`)
    })

    test('trying to create a discussion with already existing name doesnt work', async () => {
      const token = await helper.createToken(0)

      const data = {
        query: queries.createDiscussion,
        operationName: "createDiscussion",
        variables: {
          "name": "Movies"
        }
      }

      const response = await api
        .post('/graphql')
        .set({ 'Authorization': token })
        .send(data)
        .expect(200)

      expect(response.body.errors[0].message).toEqual('Name of the discussion must be unique')
    })

    test('subscribing to a discussion works', async () => {
      const token = await helper.createToken(0)

      const data = {
        query: queries.subscribeToDiscussion,
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

    test('subscribing to an already subscibed discussion doesnt work', async () => {
      const token = await helper.createToken(1)

      const data = {
        query: queries.subscribeToDiscussion,
        operationName: "subscribeToDiscussion",
        variables: {
          "discussionName": "Books"
        }
      }

      const response = await api
        .post('/graphql')
        .set({ 'Authorization': token })
        .send(data)
        .expect(200)

      expect(response.body.errors[0].message).toEqual("User has already subscribed to this discussion")
    })

    test('unsubscribing from a discussion works', async () => {
      const token = await helper.createToken(1)

      const data = {
        query: queries.unsubscribeFromDiscussion,
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

    test('unsubscribing from an unsubscribed discussion doesnt work', async () => {
      const token = await helper.createToken(0)

      const data = {
        query: queries.unsubscribeFromDiscussion,
        operationName: "unsubscribeFromDiscussion",
        variables: {
          "discussionName": "Movies"
        }
      }

      const response = await api
        .post('/graphql')
        .set({ 'Authorization': token })
        .send(data)
        .expect(200)

      expect(response.body.errors[0].message)
        .toEqual("User is not subscribed to this discussion, cannot unsubscribe")
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})