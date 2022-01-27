const supertest = require('supertest')
const mongoose = require('mongoose')

const { app } = require('../../app')
const helper = require('../testHelper')
const Post = require('../../models/Post')

const api = supertest(app)

describe('Comment', () => {
  let helperData = null

  beforeEach(async () => {
    helperData = await helper.initializeDatabase()
  })

  describe('Queries', () => {
    const queries = {
      findComment: `
        query findComment($id: ID!) {
          findComment(id: $id) {
            id
            text
            likes
            dislikes
          }
        }
      `,
      findCommentsByPost: `
        query findCommentsByPost($id: ID!) {
          findCommentsByPost(id: $id) {
            id
            text
            likes
            dislikes
          }
        }
      `,
      findCommentsByUser: `
        query findCommentsByUser($username: String!) {
          findCommentsByUser(username: $username) {
            id
            text
            likes
            dislikes
          }
        }
      `
    }

    test('specific comment is returned', async () => {
      const data = {
        query: queries.findComment,
        operationName: "findComment",
        variables: {
          "id": helperData.comments[0].id
        }
      }

      const response = await api
        .post('/graphql')
        .send(data)
        .expect(200)

      const comment = response.body.data.findComment

      expect(comment.text).toEqual(helper.initialComments[0].text)
    })

    test('comments in given post are returned', async () => {
      const data = {
        query: queries.findCommentsByPost,
        operationName: "findCommentsByPost",
        variables: {
          "id": helperData.posts[0].id
        }
      }

      const response = await api
        .post('/graphql')
        .send(data)
        .expect(200)

      const comments = response.body.data.findCommentsByPost

      expect(comments).toHaveLength(1)
      expect(comments[0].text).toEqual(helper.initialComments[0].text)
    })

    test('comments by given user are returned', async () => {
      const data = {
        query: queries.findCommentsByUser,
        operationName: "findCommentsByUser",
        variables: {
          "username": helperData.users[0].username
        }
      }

      const response = await api
        .post('/graphql')
        .send(data)
        .expect(200)

      const comments = response.body.data.findCommentsByUser

      expect(comments).toHaveLength(1)
      expect(comments[0].text).toEqual(helper.initialComments[0].text)
    })
  })

  describe('Mutations', () => {
    const queries = {
      createComment: `
        mutation createComment($text: String!, $postId: ID!) {
          createComment(text: $text, postId: $postId
          ) {
            id,
            text,
            likes,
            dislikes
          }
        }
      `,
      likeComment: `
        mutation likeComment($id: ID!) {
          likeComment(id: $id) {
            id
            text
            likes
            dislikes
          }
        }
      `,
      dislikeComment: `
        mutation dislikeComment($id: ID!) {
          dislikeComment(id: $id) {
            id
            text
            likes
            dislikes
          }
        }
      `,
      unlikeComment: `
        mutation unlikeComment($id: ID!) {
          unlikeComment(id: $id) {
            id
            text
            likes
            dislikes
          }
        }
      `,
      undislikeComment: `
        mutation undislikeComment($id: ID!) {
          undislikeComment(id: $id) {
            id
            text
            likes
            dislikes
          }
        }
      `
    }

    test('creating a comment with valid data works', async () => {
      const token = await helper.createToken(0)

      const data = {
        query: queries.createComment,
        operationName: "createComment",
        variables: {
          "text": "A magnificent test comment",
          "postId": helperData.posts[0].id
        }
      }

      const response = await api
        .post('/graphql')
        .set({ 'Authorization': token })
        .send(data)
        .expect(200)

      const comment = response.body.data.createComment
      expect(comment).not.toBeFalsy()

      const post = await Post.findOne({ _id: helperData.posts[0].id })
      expect(post.comments).toHaveLength(2)
    })

    test('creating a comment with invalid data doesnt work', async () => {
      const token = await helper.createToken(0)

      const data = {
        query: queries.createComment,
        operationName: "createComment",
        variables: {
          "text": "A magnificent test comment",
          "invalid": "invalidData"
        }
      }

      const response = await api
        .post('/graphql')
        .set({ 'Authorization': token })
        .send(data)
        .expect(400)

      expect(response.body.errors[0].message).toEqual(`Variable "$postId" of required type "ID!" was not provided.`)
    })

    test('liking a comment works, when user has not previously disliked or liked it', async () => {
      const token = await helper.createToken(0)

      const data = {
        query: queries.likeComment,
        operationName: "likeComment",
        variables: {
          "id": helperData.comments[0].id
        }
      }

      const response = await api
        .post('/graphql')
        .set({ 'Authorization': token })
        .send(data)
        .expect(200)

      const comment = response.body.data.likeComment
      expect(comment.likes).toEqual(1)
    })

    test('liking a comment works, when user has previously disliked it', async () => {
      const token = await helper.createToken(1)

      const data = {
        query: queries.likeComment,
        operationName: "likeComment",
        variables: {
          "id": helperData.comments[1].id
        }
      }

      const response = await api
        .post('/graphql')
        .set({ 'Authorization': token })
        .send(data)
        .expect(200)

      const comment = response.body.data.likeComment
      expect(comment.likes).toEqual(2)
      expect(comment.dislikes).toEqual(0)
    })

    test('disliking a comment works, when user has not previously liked or disliked it', async () => {
      const token = await helper.createToken(0)

      const data = {
        query: queries.dislikeComment,
        operationName: "dislikeComment",
        variables: {
          "id": helperData.comments[0].id
        }
      }

      const response = await api
        .post('/graphql')
        .set({ 'Authorization': token })
        .send(data)
        .expect(200)

      const comment = response.body.data.dislikeComment

      expect(comment.dislikes).toEqual(1)
    })

    test('disliking a comment works, when user has previously liked it', async () => {
      const token = await helper.createToken(2)

      const data = {
        query: queries.dislikeComment,
        operationName: "dislikeComment",
        variables: {
          "id": helperData.comments[1].id
        }
      }

      const response = await api
        .post('/graphql')
        .set({ 'Authorization': token })
        .send(data)
        .expect(200)

      const comment = response.body.data.dislikeComment

      expect(comment.dislikes).toEqual(2)
      expect(comment.likes).toEqual(0)
    })

    test('unliking a comment works', async () => {
      const token = await helper.createToken(2)

      const data = {
        query: queries.unlikeComment,
        operationName: "unlikeComment",
        variables: {
          "id": helperData.comments[1].id
        }
      }

      const response = await api
        .post('/graphql')
        .set({ 'Authorization': token })
        .send(data)
        .expect(200)

      const comment = response.body.data.unlikeComment

      expect(comment.likes).toEqual(0)
    })

    test('undisliking a comment works', async () => {
      const token = await helper.createToken(1)

      const data = {
        query: queries.undislikeComment,
        operationName: "undislikeComment",
        variables: {
          "id": helperData.comments[1].id
        }
      }

      const response = await api
        .post('/graphql')
        .set({ 'Authorization': token })
        .send(data)
        .expect(200)

      const comment = response.body.data.undislikeComment

      expect(comment.dislikes).toEqual(0)
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})