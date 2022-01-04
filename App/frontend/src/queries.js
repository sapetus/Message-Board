import { gql } from '@apollo/client'

export const ALL_DISCUSSIONS = gql`
  query allDiscussions {
    allDiscussions {
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
      comments {
        id,
        text,
        likes,
        dislikes
      },
      discussion {
        name
      }
    }
  }
`

export const GET_USER = gql`
query getUser {
  getUser {
    id
    username
    posts {
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
    comments {
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
    memberOf {
      id
      name
      members
    }
  }
}
`