import { gql } from '@apollo/client'

export const CREATE_POST = gql`
  mutation createPost($title: String!, $text: String!, $discussionName: String!) {
    createPost(
      title: $title,
      text: $text,
      discussionName: $discussionName
    ) {
      id,
      title,
      text,
      likes,
      dislikes,
      discussion {
        id,
        name
      }
    }
  }
`

export const CREATE_DISCUSSION = gql`
  mutation createDiscussion($name: String!) {
    createDiscussion(
      name: $name
    ) {
      id,
      name,
      members
    }
  }
`

export const CREATE_COMMENT = gql`
  mutation createComment($text: String!, $postId: ID!) {
    createComment(
      text: $text,
      postId: $postId
    ) {
      id,
      text,
      likes,
      dislikes
    }
  }
`

export const LIKE_POST = gql`
  mutation likePost($id: ID!) {
    likePost(
      id: $id
    ) {
      id,
      title,
      likes,
      dislikes
    }
  }
`

export const DISLIKE_POST = gql`
  mutation dislikePost($id: ID!) {
    dislikePost(
      id: $id
    ) {
      id,
      title,
      likes,
      dislikes
    }
  }
`

export const LIKE_COMMENT = gql`
  mutation likeComment($id: ID!) {
    likeComment(
      id: $id
    ) {
      id,
      text,
      likes,
      dislikes
    }
  }
`

export const DISLIKE_COMMENT = gql`
  mutation dislikeComment($id: ID!) {
    dislikeComment(
      id: $id
    ) {
      id,
      text,
      likes,
      dislikes
    }
  }
`

export const LOG_IN = gql`
  mutation login($username: String!, $password: String!) {
    login(
      username: $username,
      password: $password
    ) {
      value
    }
  }
`

export const CREATE_USER = gql`
  mutation createUser($username: String!, $password: String!) {
    createUser(
      username: $username,
      password: $password
    ) {
      id
      username
    }
  }
`

export const SUBSCRIBE_TO_DISCUSSION = gql`
  mutation subscribeToDiscussion($discussionName: String!) {
    subscribeToDiscussion(discussionName: $discussionName) {
      id
    }
  }
`

export const UNSUBSCRIBE_FROM_DISCUSSION = gql`
  mutation unsubscribeFromDiscussion($discussionName: String!) {
    unsubscribeFromDiscussion(discussionName: $discussionName) {
      id
    }
  }
`