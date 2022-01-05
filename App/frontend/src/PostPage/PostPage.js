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
  const [comments, setComments] = useState(null)
  const [discussion, setDiscussion] = useState(null)
  const [postLikes, setPostLikes] = useState(0)
  const [postDislikes, setPostDislikes] = useState(0)
  const [postText, setPostText] = useState('')
  const [postTitle, setPostTitle] = useState('')
  const [postUser, setPostUser] = useState('')
  const [postId, setPostId] = useState('')

  let params = useParams()

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

  //parse data to be easily accessible
  useEffect(() => {
    if (data?.findPost) {
      const findPostData = data.findPost
      setComments(findPostData.comments)
      setDiscussion(findPostData.discussion)
      setPostLikes(findPostData.likes)
      setPostDislikes(findPostData.dislikes)
      setPostText(findPostData.text)
      setPostTitle(findPostData.title)
      setPostUser(findPostData.user)
      setPostId(findPostData.id)
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
      <h2>
        <Link to={`/discussion/${discussion?.name}`}>
          {discussion?.name}
        </Link>
      </h2>
      <div id='post_data'>
        <h3>Title</h3>
        <p>{postTitle}</p>
        <p>Posted by <Link to={`/user/${postUser?.username}`}>{postUser?.username}</Link></p>
        <h3>Text</h3>
        <p>{postText}</p>
      </div>
      <div id='likes_dislikes'>
        <h3>Likes & Dislikes</h3>
        <p>
          {postLikes} | {postDislikes} |
          {token && <button onClick={() => postLike(postId)}>Like</button>}
          {token && <button onClick={() => postDislike(postId)}>Dislike</button>}
        </p>
      </div>
      <div id='comments'>
        <h3>Comments</h3>
        <ul>
          {comments?.map(comment =>
            <li key={comment.id}>
              {comment.text} | Likes: {comment.likes} | Dislikes: {comment.dislikes} |
              {token && <button onClick={() => commentLike(comment.id)}>Like</button>}
              {token && <button onClick={() => commentDislike(comment.id)}>Dislike</button>}
              <p>Comment by {comment.user.username}</p>
            </li>
          )}
        </ul>
      </div>
      {token &&
        <CreateCommentForm
          postId={params.id}
        />}
    </div>
  )
}

export default PostPage