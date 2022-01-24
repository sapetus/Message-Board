import { gql } from '@apollo/client'

export const ALL_DISCUSSIONS = gql`
  query allDiscussions($first: Int, $after: Int) {
    allDiscussions(first: $first, after: $after) {
      id,
      name,
      members
    }
  }
`

export const FIND_DISCUSSION = gql`
  query findDiscussion($name: String!) {
    findDiscussion(name: $name) {
      id,
      name,
      members,
      posts {
        id,
        title,
        text,
        likes,
        dislikes
      }
      listOfMembers {
        username
      }
    }
  }
`

export const FIND_POST = gql`
  query findPost($id: ID!) {
    findPost(id: $id) {
      id,
      title,
      text,
      likes,
      dislikes,
      discussion {
        name
      },
      user {
        id,
        username
      },
      listOfLikeUsers {
        id,
        username
      },
      listOfDislikeUsers {
        id,
        username
      }
    }
  }
`

export const FIND_COMMENT = gql`
  query findComment($id: ID!) {
    findComment(id: $id) {
      id,
      text,
      likes,
      dislikes,
      user {
        username
      },
      listOfLikeUsers {
        id,
        username
      },
      listOfDislikeUsers {
        id,
        username
      }
    }
  }
`

export const FIND_COMMENTS_BY_POST = gql`
  query findCommentsByPost($id: ID!, $first: Int, $after: Int) {
    findCommentsByPost(id: $id, first: $first, after: $after) {
      id,
      text,
      likes,
      dislikes,
      user {
        id,
        username
      },
      responseTo {
        id,
        text
      },
      listOfLikeUsers {
        id,
        username
      },
      listOfDislikeUsers {
        id,
        username
      }
    }
  }
`

export const GET_USER_BY_NAME = gql`
  query getUserByName($username: String!) {
    getUserByName(username: $username) {
      id
      username
      totalLikes
      totalDislikes
      creationDate
    }
  }
`

export const GET_POSTS_BY_USER = gql`
  query FindPostsByUser($username: String!, $first: Int, $after: Int) {
    findPostsByUser(username: $username, first: $first, after: $after) {
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
`

export const GET_COMMENTS_BY_USER = gql`
  query FindCommentsByUser($username: String!, $first: Int, $after: Int) {
    findCommentsByUser(username: $username, first: $first, after: $after) {
      id
      text
      likes
      dislikes
      post {
        id
        title
        discussion {
          id
          name
        }
      }
    }
  }
`

export const GET_DISCUSSIONS_USER_SUBSCRIBED_TO = gql`
  query FindDiscussionsUserHasSubscribedTo($username: String!, $first: Int, $after: Int) {
    findDiscussionsUserHasSubscribedTo(username: $username, first: $first, after: $after) {
      id
      name
      members
    }
  }
`

export const GET_POSTS_BY_DISCUSSION = gql`
  query FindPostsByDiscussion($name: String!, $first: Int, $after: Int) {
    findPostsByDiscussion(name: $name, first: $first, after: $after) {
      id
      title
      text
      likes
      dislikes
    }
  }
`