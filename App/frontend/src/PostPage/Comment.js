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

const Comment = ({ comment, token, postId, postCreatorId, fetched, setFetched, setMessage }) => {
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
    <div id={comment.id} className="comment">
      {comment.responseTo && <p className='grayText'>— {comment.responseTo.text}</p>}

      <p className="commentText">{comment.text}</p>

      <VoteButtons
        id={comment.id} token={token}
        likes={comment.likes} dislikes={comment.dislikes}
        hasLiked={userHasLikedComment} hasDisliked={userHasDislikedComment}
        likeFunction={likeComment} unlikeFunction={unlikeComment}
        dislikeFunction={dislikeComment} undislikeFunction={undislikeComment}
      />

      <p className='wrap'>
        <Link to={`/user/${comment.user.username}`}>Comment by {comment.user.username}</Link>
      </p>

      {token &&
        <CreateCommentForm
          postId={postId} commentId={comment.id}
          fetched={fetched} setFetched={setFetched}
          commentCreatorId={comment.user.id} postCreatorId={postCreatorId}
          responseToComment={true}
          setMessage={setMessage}
        />
      }
    </div >
  )
}

export default Comment