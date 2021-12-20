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