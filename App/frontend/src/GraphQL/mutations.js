import { gql } from '@apollo/client'

export const CREATE_POST = gql`
  mutation createPost($title: String!, $text: String!, $discussionName: String!, $image: String) {
    createPost(
      title: $title,
      text: $text,
      discussionName: $discussionName,
      image: $image
    ) {
      id,
      title,
      text,
      likes,
      dislikes,
      amountOfComments,
      discussion {
        id,
        name
      }
    }
  }
`

export const CREATE_DISCUSSION = gql`
  mutation createDiscussion($name: String!, $description: String!) {
    createDiscussion(
      name: $name
      description: $description
    ) {
      id,
      name,
      members,
      description
    }
  }
`

export const CREATE_COMMENT = gql`
  mutation createComment($text: String!, $postId: ID!, $commentId: ID) {
    createComment(
      text: $text,
      postId: $postId,
      responseToId: $commentId
    ) {
      id,
      text,
      likes,
      dislikes,
      user {
        id
        username
      },
      responseTo {
        id
        text
      }
    }
  }
`

export const LIKE_POST = gql`
  mutation likePost($id: ID!) {
    likePost(id: $id) {
      id,
      title,
      likes,
      dislikes
    }
  }
`

export const DISLIKE_POST = gql`
  mutation dislikePost($id: ID!) {
    dislikePost(id: $id) {
      id,
      title,
      likes,
      dislikes
    }
  }
`

export const UNLIKE_POST = gql`
  mutation unlikePost($id: ID!) {
    unlikePost(id: $id) {
      id,
      title,
      likes,
      dislikes
    }
  }
`

export const UNDISLIKE_POST = gql`
  mutation undislikePost($id: ID!) {
    undislikePost(id: $id) {
      id,
      title,
      likes,
      dislikes
    }
  }
`

export const LIKE_COMMENT = gql`
  mutation likeComment($id: ID!) {
    likeComment(id: $id) {
      id,
      text,
      likes,
      dislikes,
      listOfLikeUsers {
        id
        username
      },
      listOfDislikeUsers {
        id
        username
      }
    }
  }
`

export const DISLIKE_COMMENT = gql`
  mutation dislikeComment($id: ID!) {
    dislikeComment(id: $id) {
      id,
      text,
      likes,
      dislikes,
      listOfLikeUsers {
        id
        username
      },
      listOfDislikeUsers {
        id
        username
      }
    }
  }
`

export const UNLIKE_COMMENT = gql`
  mutation unlikeComment($id: ID!) {
    unlikeComment(id: $id) {
      id,
      text,
      likes,
      dislikes,
      listOfLikeUsers {
        id
        username
      },
      listOfDislikeUsers {
        id
        username
      }
    }
  }
`

export const UNDISLIKE_COMMENT = gql`
  mutation undislikeComment($id: ID!) {
    undislikeComment(id: $id) {
      id,
      text,
      likes,
      dislikes,
      listOfLikeUsers {
        id
        username
      },
      listOfDislikeUsers {
        id
        username
      }
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

export const CREATE_MESSAGE = gql`
  mutation CreateMessage($userId: ID!, $commentId: ID, $postId: ID, $content: String!) {
    createMessage(userId: $userId, commentId: $commentId, postId: $postId, content: $content) {
      id
    }
  }
`

export const DELETE_MESSAGE = gql`
  mutation DeleteMessage($id: ID!) {
    deleteMessage(id: $id) {
      id
    }
  }
`