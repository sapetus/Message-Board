import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useLazyQuery, useMutation } from '@apollo/client'

import { FIND_POST } from '../queries'
import {
  LIKE_POST,
  DISLIKE_POST,
  LIKE_COMMENT,
  DISLIKE_COMMENT
} from '../mutations'

import CreateCommentForm from './CreateCommentForm'

const PostPage = ({ token }) => {
  let params = useParams()
  const [post, setPost] = useState(null)

  const [getPost, { data }] = useLazyQuery(FIND_POST, {
    fetchPolicy: 'cache-and-network'
  })

  const [likePost] = useMutation(LIKE_POST, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    },
    refetchQueries: [{ query: FIND_POST, variables: { id: params.id } }]
  })
  const [dislikePost] = useMutation(DISLIKE_POST, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    },
    refetchQueries: [{ query: FIND_POST, variables: { id: params.id } }]
  })

  const [likeComment] = useMutation(LIKE_COMMENT, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    },
    refetchQueries: [{ query: FIND_POST, variables: { id: params.id } }]
  })
  const [dislikeComment] = useMutation(DISLIKE_COMMENT, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    },
    refetchQueries: [{ query: FIND_POST, variables: { id: params.id } }]
  })

  useEffect(() => {
    getPost({ variables: { id: params.id } })
  }, [params.id]) //eslint-disable-line

  useEffect(() => {
    if (data?.findPost) {
      setPost(data.findPost)
    }
  }, [data?.findPost])

  const postLike = (id) => {
    likePost({ variables: { id } })
  }
  const postDislike = (id) => {
    dislikePost({ variables: { id } })
  }

  const commentLike = (id) => {
    likeComment({ variables: { id } })
  }
  const commentDislike = (id) => {
    dislikeComment({ variables: { id } })
  }

  return (
    <div>
      <h1>Post Page</h1>
      <div>
        <h2>
          <Link to={`/discussion/${post?.discussion.name}`}>
            {post?.discussion.name}
          </Link>
        </h2>
        <h3>Title</h3>
        <p>{post?.title}</p>
        <p>Posted by <Link to={`/user/${post?.user.username}`}>{post?.user.username}</Link></p>
        <h3>Text</h3>
        <p>{post?.text}</p>
        <h3>Likes & Dislikes</h3>
        <p>
          {post?.likes} | {post?.dislikes} |
          {token && <button onClick={() => postLike(post.id)}>Like</button>}
          {token && <button onClick={() => postDislike(post.id)}>Dislike</button>}
        </p>
        <h3>Comments</h3>
        <ul>
          {post?.comments.map(comment =>
            <li key={comment.id}>
              {comment.text} | Likes: {comment.likes} | Dislikes: {comment.dislikes} |
              {token && <button onClick={() => commentLike(comment.id)}>Like</button>}
              {token && <button onClick={() => commentDislike(comment.id)}>Dislike</button>}
              <p>Comment by {comment.user.username}</p>
            </li>
          )}
        </ul>
        {token &&
          <CreateCommentForm
            postId={params.id}
          />}
      </div>
    </div>
  )
}

export default PostPage