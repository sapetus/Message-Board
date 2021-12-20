import { gql } from '@apollo/client'

export const ALL_DISCUSSIONS = gql`
  query allDiscussions {
    allDiscussions {
      name,
      members,
      posts {
        title,
        text,
        likes,
        dislikes
      }
    }
  }
`

export const FIND_DISCUSSION = gql`
  query findDiscussion($name: String!) {
    findDiscussion(name: $name) {
      name,
      members,
      posts {
        id,
        title,
        text,
        likes,
        dislikes
      }
    }
  }
`