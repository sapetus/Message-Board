import React, { useEffect, useState } from 'react'
import { useMutation } from '@apollo/client'

import VoteButtons from '../Components/VoteButtons'

import { FIND_POST, FIND_COMMENTS_BY_POST } from '../GraphQL/queries'
import {
  LIKE_COMMENT,
  UNLIKE_COMMENT,
  DISLIKE_COMMENT,
  UNDISLIKE_COMMENT
} from '../GraphQL/mutations'

//is it better to fetch each comment separately, or fetch all comments when the post they are associated with is queried?
const Comment = ({ comment, token, postId }) => {
  const [userHasLikedComment, setUserHasLikedComment] = useState(false)
  const [userHasDislikedComment, setUserHasDislikedComment] = useState(false)

  const [likeComment] = useMutation(LIKE_COMMENT, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    },
    refetchQueries: [
      { query: FIND_POST, variables: { id: postId } },
      { query: FIND_COMMENTS_BY_POST, variables: { id: postId } }
    ]
  })

  const [dislikeComment] = useMutation(DISLIKE_COMMENT, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    },
    refetchQueries: [
      { query: FIND_POST, variables: { id: postId } },
      { query: FIND_COMMENTS_BY_POST, variables: { id: postId } }
    ]
  })

  const [unlikeComment] = useMutation(UNLIKE_COMMENT, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    },
    refetchQueries: [
      { query: FIND_POST, variables: { id: postId } },
      { query: FIND_COMMENTS_BY_POST, variables: { id: postId } }
    ]
  })

  const [undislikeComment] = useMutation(UNDISLIKE_COMMENT, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    },
    refetchQueries: [
      { query: FIND_POST, variables: { id: postId } },
      { query: FIND_COMMENTS_BY_POST, variables: { id: postId } }
    ]
  })

  //set values for conditional rendering of vote buttons
  useEffect(() => {
    if (comment?.listOfLikeUsers && token) {
      const likeUsernames = comment.listOfLikeUsers.map(user => user.username)
      setUserHasLikedComment(likeUsernames.includes(localStorage.getItem('username')))
    }
    if (comment?.listOfDislikeUsers && token) {
      const dislikeUsernames = comment.listOfDislikeUsers.map(user => user.username)
      setUserHasDislikedComment(dislikeUsernames.includes(localStorage.getItem('username')))
    }
  }, [comment?.listOfLikeUsers, comment?.listOfDislikeUsers, token])

  return (
    <li className="comment">
      {comment.text} | Likes: {comment.likes} | Dislikes: {comment.dislikes} |
      <VoteButtons
        id={comment.id} token={token}
        hasLiked={userHasLikedComment} hasDisliked={userHasDislikedComment}
        likeFunction={likeComment} unlikeFunction={unlikeComment}
        dislikeFunction={dislikeComment} undislikeFunction={undislikeComment}
      />
      <p>Comment by {comment.user.username}</p>
    </li >
  )
}

export default Comment