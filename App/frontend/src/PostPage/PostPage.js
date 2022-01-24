import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useLazyQuery, useMutation } from '@apollo/client'

import {
  FIND_POST,
  FIND_COMMENTS_BY_POST
} from '../GraphQL/queries'
import {
  LIKE_POST,
  DISLIKE_POST,
  UNLIKE_POST,
  UNDISLIKE_POST,
} from '../GraphQL/mutations'

import CreateCommentForm from './CreateCommentForm'
import Comment from './Comment'
import VoteButtons from '../Components/VoteButtons'

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
  const [commentsFetched, setCommentsFetched] = useState(0)

  let params = useParams()
  const amountToFetch = 5

  const [getPost, { data: getPostData }] = useLazyQuery(
    FIND_POST,
    { fetchPolicy: 'cache-and-network' }
  )

  const [getComments, { data: getCommentsData, fetchMore }] = useLazyQuery(
    FIND_COMMENTS_BY_POST,
    { fetchPolicy: 'cache-and-network' }
  )

  const [likePost] = useMutation(
    LIKE_POST,
    {
      onError: (error) => {
        console.log(error.graphQLErrors[0].message)
      },
      refetchQueries: [{ query: FIND_POST, variables: { id: params.id } }]
    })

  const [dislikePost] = useMutation(
    DISLIKE_POST,
    {
      onError: (error) => {
        console.log(error.graphQLErrors[0].message)
      },
      refetchQueries: [{ query: FIND_POST, variables: { id: params.id } }]
    })

  const [unlikePost] = useMutation(
    UNLIKE_POST,
    {
      onError: (error) => {
        console.log(error.graphQLErrors[0].message)
      },
      refetchQueries: [{ query: FIND_POST, variables: { id: params.id } }]
    })

  const [undislikePost] = useMutation(
    UNDISLIKE_POST,
    {
      onError: (error) => {
        console.log(error.graphQLErrors[0].message)
      },
      refetchQueries: [{ query: FIND_POST, variables: { id: params.id } }]
    })

  useEffect(() => {
    setCommentsFetched(amountToFetch)

    getPost({ variables: { id: params.id } })
    getComments({ variables: { id: params.id, first: amountToFetch } })
  }, [params.id]) //eslint-disable-line

  //parse post data to be easily accessible
  useEffect(() => {
    if (getPostData?.findPost) {
      const findPostData = getPostData.findPost
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
  }, [getPostData?.findPost])

  //parse post's comment data 
  useEffect(() => {
    if (getCommentsData?.findCommentsByPost) {
      setComments(getCommentsData.findCommentsByPost.slice(0, commentsFetched))
    }
  }, [getCommentsData?.findCommentsByPost, commentsFetched])

  //set values for conditional rendering of like and dislike buttons
  useEffect(() => {
    if (listOfLikeUsers && token) {
      const likeUsernames = listOfLikeUsers.map(user => user.username)
      setUserHasLikedPost(likeUsernames.includes(localStorage.getItem('username')))
    }
    if (listOfDislikeUsers && token) {
      const dislikeUsernames = listOfDislikeUsers.map(user => user.username)
      setUserHasDislikedPost(dislikeUsernames.includes(localStorage.getItem('username')))
    }
  }, [listOfLikeUsers, listOfDislikeUsers, token])

  const fetchMoreComments = async () => {
    const { data } = await fetchMore({
      variables: {
        id: params.id,
        first: amountToFetch,
        after: getCommentsData.findCommentsByPost.length
      }
    })

    if (data.findCommentsByPost.length + getCommentsData.findCommentsByPost.length > commentsFetched) {
      setCommentsFetched(commentsFetched + amountToFetch)
    }
  }

  const showLess = () => {
    if (commentsFetched - amountToFetch >= amountToFetch) {
      setCommentsFetched(commentsFetched - amountToFetch)
    }
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
              key={comment.id}
              postId={params.id}
              comment={comment}
              token={token}
              fetched={commentsFetched}
              setFetched={setCommentsFetched}
            />
          )}
        </ul>
        <button onClick={fetchMoreComments}>Show More</button>
        <button onClick={showLess}>Show Less</button>
      </div>

      {token &&
        <CreateCommentForm
          postId={params.id}
          fetched={commentsFetched}
          setFetched={setCommentsFetched}
        />
      }
    </div>
  )
}

export default PostPage