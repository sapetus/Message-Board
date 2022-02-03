import { gql } from '@apollo/client'

export const ALL_DISCUSSIONS = gql`
  query allDiscussions($first: Int, $after: Int, $order: Order, $filter: String) {
    allDiscussions(first: $first, after: $after, order: $order, filter: $filter) {
      id,
      name,
      members,
      description
    }
  }
`

export const FIND_DISCUSSION = gql`
  query findDiscussion($name: String!) {
    findDiscussion(name: $name) {
      id,
      name,
      description,
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
      image
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
  query findCommentsByPost($id: ID!, $first: Int, $after: Int, $order: Order) {
    findCommentsByPost(id: $id, first: $first, after: $after, order: $order) {
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
  query FindPostsByUser($username: String!, $first: Int, $after: Int, $order: Order) {
    findPostsByUser(username: $username, first: $first, after: $after, order: $order) {
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
  query FindCommentsByUser($username: String!, $first: Int, $after: Int, $order: Order) {
    findCommentsByUser(username: $username, first: $first, after: $after, order: $order) {
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
  query FindDiscussionsUserHasSubscribedTo($username: String!, $first: Int, $after: Int, $order: Order) {
    findDiscussionsUserHasSubscribedTo(username: $username, first: $first, after: $after, order: $order) {
      id
      name
      members
    }
  }
`

export const GET_POSTS_BY_DISCUSSION = gql`
  query FindPostsByDiscussion($name: String!, $first: Int, $after: Int, $order: Order, $filter: String) {
    findPostsByDiscussion(name: $name, first: $first, after: $after, order: $order, filter: $filter) {
      id
      title
      text
      likes
      dislikes
    }
  }
`