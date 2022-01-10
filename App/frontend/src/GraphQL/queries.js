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
  query findCommentsByPost($id: ID!) {
    findCommentsByPost(id: $id) {
      id,
      text,
      likes,
      dislikes,
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

export const GET_USER_BY_NAME = gql`
  query getUserByName($username: String!) {
    getUserByName(username: $username) {
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