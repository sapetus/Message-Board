import React, { useEffect, useState } from 'react'
import { useMutation } from '@apollo/client'
import { Link } from 'react-router-dom'

import VoteButtons from '../Components/VoteButtons'
import CreateCommentForm from './CreateCommentForm'

import {
  LIKE_COMMENT,
  UNLIKE_COMMENT,
  DISLIKE_COMMENT,
  UNDISLIKE_COMMENT
} from '../GraphQL/mutations'

const Comment = ({ comment, token, postId, fetched, setFetched }) => {
  const [userHasLikedComment, setUserHasLikedComment] = useState(false)
  const [userHasDislikedComment, setUserHasDislikedComment] = useState(false)

  const [likeComment] = useMutation(LIKE_COMMENT, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    }
  })

  const [dislikeComment] = useMutation(DISLIKE_COMMENT, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    }
  })

  const [unlikeComment] = useMutation(UNLIKE_COMMENT, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    }
  })

  const [undislikeComment] = useMutation(UNDISLIKE_COMMENT, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    }
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
    <div className="comment">
      {comment.responseTo &&
        //Please, change this later. Here just to make things a bit clearer
        <p className='grayText'>- {comment.responseTo.text}</p>
      }

      <p>{comment.text}</p>

      <VoteButtons
        id={comment.id} token={token}
        likes={comment.likes} dislikes={comment.dislikes}
        hasLiked={userHasLikedComment} hasDisliked={userHasDislikedComment}
        likeFunction={likeComment} unlikeFunction={unlikeComment}
        dislikeFunction={dislikeComment} undislikeFunction={undislikeComment}
      />

      <p>Comment by <Link to={`/user/${comment.user.username}`}>{comment.user.username}</Link></p>

      <CreateCommentForm
        postId={postId}
        commentId={comment.id}
        fetched={fetched}
        setFetched={setFetched}
      />
    </div >
  )
}

export default Comment