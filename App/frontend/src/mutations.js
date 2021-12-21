import { gql } from '@apollo/client'

export const CREATE_POST = gql`
  mutation createPost($title: String!, $text: String!, $discussionName: String!) {
    createPost(
      title: $title,
      text: $text,
      discussionName: $discussionName
    ) {
      title,
      text,
      likes,
      dislikes,
      discussionName,
      id 
    }
  }
`

export const CREATE_DISCUSSION = gql`
  mutation createDiscussion($name: String!) {
    createDiscussion(
      name: $name
    ) {
      name,
      members
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