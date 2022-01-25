const bcrypt = require('bcrypt')

const Discussion = require('../models/Discussion')
const Comment = require('../models/Comment')
const Post = require('../models/Post')
const User = require('../models/User')

const initialDiscussions = [
  {
    name: "Movies",
    members: 0,
    posts: [],
    listOfMembers: []
  },
  {
    name: "Books",
    members: 0,
    posts: [],
    listOfMembers: []
  }
]

const initialPosts = [
  {
    title: "Highest grossing movie?",
    text: "I remember that Titanic was number one at some point. Have things changed?",
    likes: 0,
    dislikes: 0,
    comments: [],
    listOfLikeUsers: [],
    listOfDislikeUsers: []
  },
  {
    title: "How many books has Stephen King written?",
    text: "Must be atleast couple of dozen novels!",
    likes: 0,
    dislikes: 0,
    comments: [],
    listOfLikeUsers: [],
    listOfDislikeUsers: []
  }
]

const initialComments = [
  {
    text: "It is Avatar, also by James Cameron.",
    likes: 0,
    dislikes: 0,
    listOfLikeUsers: [],
    listOfDislikeUsers: []
  },
  {
    text: "He has written 63 novels, 11 collections, 5 nonfiction, 19 screenplays, and 16 other works of literature",
    likes: 0,
    dislikes: 0,
    listOfLikeUsers: [],
    listOfDislikeUsers: []
  }
]

const initialUsers = [
  {
    username: "movieFan",
    totalLikes: 0,
    totalDislikes: 0,
    creationDate: "2022-01-20T09:57:48.829Z",
    posts: [],
    comments: [],
    memberOf: [],
    postLikes: [],
    postDislikes: [],
    commentLikes: [],
    commentDislikes: []
  },
  {
    username: "bookFan",
    totalLikes: 0,
    totalDislikes: 0,
    creationDate: "2022-01-20T09:38:34.994Z",
    posts: [],
    comments: [],
    memberOf: [],
    postLikes: [],
    postDislikes: [],
    commentLikes: [],
    commentDislikes: []
  }
]

const initializeDatabase = async () => {
  await clearDb()

  const discussions = await initDiscussions()
  const posts = await initPosts()
  const comments = await initComments()
  const users = await initUsers()

  const updatedDiscussions = await updateDiscussions(discussions, posts)
  const updatedComments = await updateComments(comments, users, posts)
  const updatedPosts = await updatePosts(posts, users, comments, discussions)
  const updatedUsers = await updateUsers(users, posts, comments)

  return {
    discussions: updatedDiscussions,
    posts: updatedPosts,
    comments: updatedComments,
    users: updatedUsers
  }
}

const clearDb = async () => {
  await Discussion.deleteMany({})
  await Comment.deleteMany({})
  await Post.deleteMany({})
  await User.deleteMany({})
}

const initDiscussions = async () => {
  await Discussion.insertMany(initialDiscussions)
  const discussions = await Discussion.find({})

  return discussions
}

const updateDiscussions = async (discussions, posts) => {
  await Discussion.findOneAndUpdate(
    { _id: discussions[0].id },
    { posts: [posts[0].id] },
    { new: true }
  )
  await Discussion.findOneAndUpdate(
    { _id: discussions[1].id },
    { posts: [posts[1].id] },
    { new: true }
  )

  const updatedDiscussions = await Discussion.find({})

  return updatedDiscussions
}

const initPosts = async () => {
  await Post.insertMany(initialPosts)
  const posts = await Post.find({})

  return posts
}

const updatePosts = async (posts, users, comments, discussions) => {
  await Post.findOneAndUpdate(
    { _id: posts[0].id },
    { user: users[1].id, comments: [comments[0].id], discussion: discussions[0].id },
    { new: true }
  )
  await Post.findOneAndUpdate(
    { _id: posts[1].id },
    { user: users[0].id, comments: [comments[1].id], discussions: discussions[1].id },
    { new: true }
  )

  const updatedPosts = await Post.find({})

  return updatedPosts
}

const initComments = async () => {
  await Comment.insertMany(initialComments)
  const comments = await Comment.find({})

  return comments
}

const updateComments = async (comments, users, posts) => {
  await Comment.findOneAndUpdate(
    { _id: comments[0].id },
    { user: users[0].id, post: posts[0].id },
    { new: true }
  )
  await Comment.findOneAndUpdate(
    { _id: comments[1].id },
    { user: users[1].id, post: posts[1].id },
    { new: true }
  )

  const updatedComments = await Comment.find({})

  return updatedComments
}

const initUsers = async () => {
  //both test users use same password
  const passwordHash = await bcrypt.hash("password", 10)
  initialUsers.map(user => {
    user.passwordHash = passwordHash
  })

  await User.insertMany(initialUsers)
  const users = await User.find({})

  return users
}

const updateUsers = async (users, posts, comments) => {
  await User.findOneAndUpdate(
    { _id: users[0].id },
    { posts: [posts[1].id], comments: [comments[0].id] },
    { new: true }
  )
  await User.findOneAndUpdate(
    { id: users[1].id },
    { posts: [posts[0].id], comments: [comments[1].id] },
    { new: true }
  )

  const updatedUsers = await User.find({})

  return updatedUsers
}

module.exports = {
  initialDiscussions,
  initialPosts,
  initialComments,
  initialUsers,
  initializeDatabase
}