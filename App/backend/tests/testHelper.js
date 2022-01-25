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

module.exports = {
  initialDiscussions,
  initialPosts,
  initialComments,
  initialUsers
}