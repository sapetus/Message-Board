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
    const queries = {
      findPost: `
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
      findPostsByUser: `
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
      findPostsByDiscussion: `
        query findPostsByDiscussion($name: String!) {
          findPostsByDiscussion(name: $name) {
            id
            title
            text
            likes
            dislikes
          }
        }
      `
    }

    test('specific post is returned', async () => {
      const data = {
        query: queries.findPost,
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
        query: queries.findPostsByUser,
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
        query: queries.findPostsByDiscussion,
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
    const queries = {
      createPost: `
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
      likePost: `
        mutation likePost($id: ID!) {
          likePost(id: $id) {
            id
            title
            likes
            dislikes
          }
        }
      `,
      dislikePost: `
        mutation dislikePost($id: ID!) {
          dislikePost(id: $id) {
            id
            title
            likes
            dislikes
          }
        }
      `,
      unlikePost: `
        mutation unlikePost($id: ID!) {
          unlikePost(id: $id) {
            id
            title
            likes
            dislikes
          }
        }
      `,
      undislikePost: `
        mutation undislikePost($id: ID!) {
          undislikePost(id: $id) {
            id
            title
            likes
            dislikes
          }
        }
      `
    }

    test('creation of a new post with valid data works', async () => {
      const token = await helper.createToken(0)

      const data = {
        query: queries.createPost,
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

    test('creation of a new post with invalid data doesnt work', async () => {
      const token = await helper.createToken(0)

      const data = {
        query: queries.createPost,
        operationName: "createPost",
        variables: {
          "title": "imaginative title",
          "text": "imaginative text",
          "invalid": "invalid"
        }
      }

      const response = await api
        .post('/graphql')
        .set({ 'Authorization': token })
        .send(data)
        .expect(400)

      expect(response.body.errors[0].message).toEqual(`Variable "$discussionName" of required type "String!" was not provided.`)
    })

    test('liking a post works, when user has not disliked or liked it previosly', async () => {
      const token = await helper.createToken(0)

      const data = {
        query: queries.likePost,
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

    test('liking a post works, when user has previously disliked it', async () => {
      const token = await helper.createToken(1)

      const data = {
        query: queries.likePost,
        operationName: "likePost",
        variables: {
          "id": helperData.posts[1].id
        }
      }

      const response = await api
        .post('/graphql')
        .set({ 'Authorization': token })
        .send(data)
        .expect(200)

      const post = response.body.data.likePost

      expect(post).not.toBeFalsy()
      expect(post.likes).toEqual(2)
      expect(post.dislikes).toEqual(0)
    })

    test('disliking a post works, when user has not disliked or liked it previously', async () => {
      const token = await helper.createToken(0)

      const data = {
        query: queries.dislikePost,
        operationName: "dislikePost",
        variables: {
          "id": helperData.posts[0].id
        }
      }

      const response = await api
        .post('/graphql')
        .set({ 'Authorization': token })
        .send(data)
        .expect(200)

      const post = response.body.data.dislikePost

      expect(post).not.toBeFalsy()
      expect(post.dislikes).toEqual(1)
    })

    test('disliking a post works, when user has previously liked it', async () => {
      const token = await helper.createToken(2)

      const data = {
        query: queries.dislikePost,
        operationName: "dislikePost",
        variables: {
          "id": helperData.posts[1].id
        }
      }

      const response = await api
        .post('/graphql')
        .set({ 'Authorization': token })
        .send(data)
        .expect(200)

      const post = response.body.data.dislikePost

      expect(post).not.toBeFalsy()
      expect(post.dislikes).toEqual(2)
      expect(post.likes).toEqual(0)
    })

    test('unliking a post works', async () => {
      const token = await helper.createToken(2)

      const data = {
        query: queries.unlikePost,
        operationName: "unlikePost",
        variables: {
          "id": helperData.posts[1].id
        }
      }

      const response = await api
        .post('/graphql')
        .set({ 'Authorization': token })
        .send(data)

      const post = response.body.data.unlikePost

      expect(post).not.toBeFalsy()
      expect(post.likes).toEqual(0)
    })

    test('undisliking a post works', async () => {
      const token = await helper.createToken(1)

      const data = {
        query: queries.undislikePost,
        operationName: "undislikePost",
        variables: {
          "id": helperData.posts[1].id
        }
      }

      const response = await api
        .post('/graphql')
        .set({ 'Authorization': token })
        .send(data)
        .expect(200)

      const post = response.body.data.undislikePost

      expect(post).not.toBeFalsy()
      expect(post.dislikes).toEqual(0)
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})