import React from 'react'
import { useMutation } from '@apollo/client'

import VoteButtons from '../Universal/VoteButtons'

import { FIND_POST } from '../queries'
import {
  LIKE_COMMENT,
  DISLIKE_COMMENT
} from '../mutations'

const Comment = ({ comment, token, postId }) => {
  const [likeComment] = useMutation(LIKE_COMMENT, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    },
    refetchQueries: [{ query: FIND_POST, variables: { id: postId } }]
  })

  const [dislikeComment] = useMutation(DISLIKE_COMMENT, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    },
    refetchQueries: [{ query: FIND_POST, variables: { id: postId } }]
  })

  const commentLike = (id) => {
    likeComment({ variables: { id } })
  }

  const commentDislike = (id) => {
    dislikeComment({ variables: { id } })
  }

  return (
    <li className="comment">
      {comment.text} | Likes: {comment.likes} | Dislikes: {comment.dislikes} |
      <div className="comment_vote_buttons">
        {token && <button onClick={() => commentLike(comment.id)}>Like</button>}
        {token && <button onClick={() => commentDislike(comment.id)}>Dislike</button>}
      </div>
      <p>Comment by {comment.user.username}</p>
    </li>
  )
}

export default Comment