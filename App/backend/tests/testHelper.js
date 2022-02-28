require('dotenv').config()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const Discussion = require('../models/Discussion')
const Message = require('../models/Message')
const Comment = require('../models/Comment')
const Post = require('../models/Post')
const User = require('../models/User')

const JWT_SECRET = process.env.JWT_SECRET

/* state of the data in DB after initialization
USERS-------------------------
User[0] {
  comments: [Comment[0]],
  posts: [Post[1]]
}
User[1] {
  comments: [Comment[1]],
  posts: [Post[0]],
  memberOf: [Discussion[1]],
  postDislikes: [Post[1]]
  commentDislikes: [Comment[1]]
}
User[2] {
  postLikes: [Post[1]]
  commentLikes: [Comment[1]]
}

COMMENTS--------------------
Comment[0] {
  user: User[0],
  post: Post[0]
}
Comment[1] {
  user: User[1],
  post: Post[1],
  likes: 1,
  dislikes: 1,
  listOfLikeUsers: [User[2]],
  listOfDislikeUsers: [User[1]]
}

POSTS------------------------
Post[0] {
  user: User[1],
  comments: [Comment[0]],
  discussion: Discussion[0]
}
Post[1] {
  user: User[0],
  comments: [Comment[1]],
  discussion: Discussion[1],
  likes: 1,
  dislikes: 1,
  listOfLikeUsers: [User[2]]
  listOfDislikeUsers: [User[1]]
}

DISCUSSIONS----------------------
Discussion[0] {
  posts: [Post[0]]
}
Discussion[1] {
  posts: [Post[1]],
  members: 1,
  listOfMembers: [User[1]]
}

MESSAGES-------------------------
Message[0] {
  user: User[0]
  comment: Comment[0]
  seen: false
}
Message[1] {
  user: User[0]
  post: Post[0]
  seen: false
}
*/

const initialDiscussions = [
  {
    name: "Movies",
    description: "A discussion about movies",
    members: 0,
    posts: [],
    listOfMembers: []
  },
  {
    name: "Books",
    description: "A discussion about books",
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
  },
  {
    username: "fanFan",
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
  }
]

const initialMessages = [
  {
    seen: false
  },
  {
    seen: false
  }
]

//Create token for a user in initialUsers with index
const createToken = async (index) => {
  const user = await User.findOne({ username: initialUsers[index].username })

  const userForToken = {
    username: user.username,
    id: user._id
  }

  const token = `bearer ${jwt.sign(userForToken, JWT_SECRET)}`

  return token
}

const initializeDatabase = async () => {
  await clearDb()

  const discussions = await initDiscussions()
  const posts = await initPosts()
  const comments = await initComments()
  const users = await initUsers()
  const messages = await initMessages()

  //update each with associated data (post gets an user, discussion gets posts, posts get comments etc.)
  const updatedDiscussions = await updateDiscussions(discussions, posts, users)
  const updatedComments = await updateComments(comments, users, posts)
  const updatedPosts = await updatePosts(posts, users, comments, discussions)
  const updatedUsers = await updateUsers(users, posts, comments, discussions)
  const updatedMessages = await updateMessages()

  return {
    discussions: updatedDiscussions,
    posts: updatedPosts,
    comments: updatedComments,
    users: updatedUsers,
    messages: updatedMessages
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

const updateDiscussions = async (discussions, posts, users) => {
  await Discussion.findOneAndUpdate(
    { _id: discussions[0].id },
    { posts: [posts[0].id] },
    { new: true }
  )
  await Discussion.findOneAndUpdate(
    { _id: discussions[1].id },
    { posts: [posts[1].id], members: 1, listOfMembers: [users[1].id] },
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
    {
      user: users[0].id,
      comments: [comments[1].id],
      discussion: discussions[1].id,
      listOfLikeUsers: [users[2].id],
      listOfDislikeUsers: [users[1].id],
      likes: 1,
      dislikes: 1
    },
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
    {
      user: users[1].id,
      post: posts[1].id,
      likes: 1,
      dislikes: 1,
      listOfLikeUsers: [users[2].id],
      listOfDislikeUsers: [users[1].id]
    },
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

const updateUsers = async (users, posts, comments, discussions) => {
  await User.findOneAndUpdate(
    { _id: users[0].id },
    { posts: [posts[1].id], comments: [comments[0].id] },
    { new: true }
  )
  await User.findOneAndUpdate(
    { _id: users[1].id },
    {
      posts: [posts[0].id],
      comments: [comments[1].id],
      memberOf: [discussions[1].id],
      postDislikes: [posts[1].id],
      commentDislikes: [comments[1].id]
    },
    { new: true }
  )
  await User.findOneAndUpdate(
    { _id: users[2].id },
    { postLikes: [posts[1].id], commentLikes: [comments[1].id] },
    { new: true }
  )

  const updatedUsers = await User.find({})

  return updatedUsers
}

const initMessages = async () => {
  await Message.insertMany(initialMessages)
  const messages = await Message.find({})

  return messages
}

const updateMessages = async () => {
  return []
}

module.exports = {
  initialDiscussions,
  initialPosts,
  initialComments,
  initialUsers,
  initializeDatabase,
  createToken
}