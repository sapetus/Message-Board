const supertest = require('supertest')
const mongoose = require('mongoose')

const { app } = require('../../app')
const helper = require('../testHelper')
const Discussion = require('../../models/Discussion')

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
      expect(posts[0].text).toEqual(helper.initialPosts[1].text)
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
    test('creation of a new post works', async () => {
      const token = await helper.createToken(0)

      const data = {
        query: `
          mutation createPost($title: String!, $text: String!, $discussionName: String!) {
            createPost(title: $title, text: $text, discussionName: $discussionName) {
              id
              title
              text
              likes
              dislikes
              discussion {
                id
                name
              }
            }
          }
        `,
        operationName: "createPost",
        variables: {
          "title": "Best 90's disaster movie?",
          "text": "My vote goes for Armageddon",
          "discussionName": "Movies"
        }
      }

      const response = await api
        .post('/graphql')
        .set({ 'Authorization': token })
        .send(data)
        .expect(200)

      expect(response.body.data.createPost).not.toBeFalsy()

      const discussion = await Discussion.findOne({ name: "Movies" })
      expect(discussion.posts).toHaveLength(2)
    })

    test('liking a post works, when user has not disliked it previosly', async () => {
      const token = await helper.createToken(0)

      const data = {
        query: `
          mutation likePost($id: ID!) {
            likePost(id: $id) {
              id
              title
              likes
              dislikes
            }
          }
        `,
        operationName: "likePost",
        variables: {
          "id": helperData.posts[0].id
        }
      }

      const response = await api
        .post('/graphql')
        .set({ 'Authorization': token })
        .send(data)
        .expect(200)

      const post = response.body.data.likePost
      expect(post).not.toBeFalsy()
      expect(post.likes).toEqual(1)
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})