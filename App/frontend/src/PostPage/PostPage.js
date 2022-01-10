import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useLazyQuery, useMutation } from '@apollo/client'

import { FIND_POST } from '../queries'
import {
  LIKE_POST,
  DISLIKE_POST,
  UNLIKE_POST,
  UNDISLIKE_POST,
} from '../mutations'

import CreateCommentForm from './CreateCommentForm'
import Comment from './Comment'
import VoteButtons from '../Universal/VoteButtons'

const PostPage = ({ token }) => {
  const [comments, setComments] = useState(null)
  const [discussion, setDiscussion] = useState(null)
  const [postLikes, setPostLikes] = useState(0)
  const [postDislikes, setPostDislikes] = useState(0)
  const [postText, setPostText] = useState('')
  const [postTitle, setPostTitle] = useState('')
  const [postUser, setPostUser] = useState('')
  const [postId, setPostId] = useState('')
  const [listOfLikeUsers, setListOfLikeUsers] = useState(null)
  const [listOfDislikeUsers, setListOfDislikeUsers] = useState(null)
  const [userHasLikedPost, setUserHasLikedPost] = useState(false)
  const [userHasDislikedPost, setUserHasDislikedPost] = useState(false)

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

  const [unlikePost] = useMutation(UNLIKE_POST, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    },
    refetchQueries: [{ query: FIND_POST, variables: { id: params.id } }]
  })

  const [undislikePost] = useMutation(UNDISLIKE_POST, {
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
      setListOfLikeUsers(findPostData.listOfLikeUsers)
      setListOfDislikeUsers(findPostData.listOfDislikeUsers)
    }
  }, [data?.findPost])

  //set values for conditional rendering of like and dislike buttons
  useEffect(() => {
    if (listOfLikeUsers && token) {
      const likeUserNames = listOfLikeUsers.map(user => user.username)
      setUserHasLikedPost(likeUserNames.includes(localStorage.getItem('username')))
    }
    if (listOfDislikeUsers && token) {
      const dislikeUserNames = listOfDislikeUsers.map(user => user.username)
      setUserHasDislikedPost(dislikeUserNames.includes(localStorage.getItem('username')))
    }
  }, [listOfLikeUsers, listOfDislikeUsers, token])

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
        {postLikes} | {postDislikes}
        <div id="post_vote_buttons">
          <VoteButtons
            id={postId} token={token}
            hasLiked={userHasLikedPost} hasDisliked={userHasDislikedPost}
            likeFunction={likePost} unlikeFunction={unlikePost}
            dislikeFunction={dislikePost} undislikeFunction={undislikePost}
          />
        </div>
      </div>
      <div id='comments'>
        <h3>Comments</h3>
        <ul>
          {comments?.map(comment =>
            <Comment
              key={comment.id} comment={comment}
              token={token} postId={params.id}
            />
          )}
        </ul>
      </div>
      {token &&
        <CreateCommentForm postId={params.id} />}
    </div>
  )
}

export default PostPage