import React, { useEffect, useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { useLazyQuery, useQuery, useMutation } from '@apollo/client'

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
import Modal from '../Components/Modal'

const PostPage = ({ token }) => {
  //TOO MUCH STATES!!!!
  const [comments, setComments] = useState(null)
  const [discussion, setDiscussion] = useState(null)
  const [postLikes, setPostLikes] = useState(0)
  const [postDislikes, setPostDislikes] = useState(0)
  const [postCommentCount, setPostCommentCount] = useState(0)
  const [postText, setPostText] = useState('')
  const [postTitle, setPostTitle] = useState('')
  const [postImage, setPostImage] = useState(null)
  const [postUser, setPostUser] = useState('')
  const [postId, setPostId] = useState('')
  const [listOfLikeUsers, setListOfLikeUsers] = useState(null)
  const [listOfDislikeUsers, setListOfDislikeUsers] = useState(null)
  const [userHasLikedPost, setUserHasLikedPost] = useState(false)
  const [userHasDislikedPost, setUserHasDislikedPost] = useState(false)
  const [commentsFetched, setCommentsFetched] = useState(0)
  const [commentOrder, setCommentOrder] = useState('NEW')
  const [message, setMessage] = useState(null)

  let params = useParams()
  const location = useLocation()
  const amountToFetch = 5

  const [getPost, { data: getPostData }] = useLazyQuery(
    FIND_POST,
    { fetchPolicy: 'cache-and-network' }
  )

  const { data: getCommentsData, fetchMore } = useQuery(
    FIND_COMMENTS_BY_POST,
    {
      fetchPolicy: "cache-and-network",
      variables: { id: params.id, first: amountToFetch, order: commentOrder }
    }
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
  }, [params.id]) //eslint-disable-line

  //parse post data to be easily accessible
  useEffect(() => {
    if (getPostData?.findPost) {
      const findPostData = getPostData.findPost
      setPostImage(findPostData.image)
      setDiscussion(findPostData.discussion)
      setPostLikes(findPostData.likes)
      setPostDislikes(findPostData.dislikes)
      setPostCommentCount(findPostData.amountOfComments)
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

  //this will focus to a specific comment when user directs here from a message
  useEffect(() => {
    if (location.hash) {
      scrollToComment()
    }
  }, [location]) //eslint-disable-line

  const scrollToComment = () => {
    setTimeout(() => {
      if (document.getElementById(location.hash.slice(1)) === null) {
        scrollToComment()
        //for some reason, calling the fetchMore function doesn't work here
        document.getElementById('fetchMoreButton').click()
      } else {
        const element = document.getElementById(location.hash.slice(1))
        window.scrollTo({
          top: element.getBoundingClientRect().top + window.scrollY + 25,
          behavior: "smooth"
        })
      }
    }, 100)
  }

  const fetchMoreComments = async () => {
    const { data } = await fetchMore({
      variables: {
        id: params.id,
        first: amountToFetch,
        after: getCommentsData?.findCommentsByPost.length
      }
    })

    if (data.findCommentsByPost.length + getCommentsData?.findCommentsByPost.length > commentsFetched) {
      setCommentsFetched(commentsFetched + amountToFetch)
    }
  }

  const showLess = () => {
    if (commentsFetched - amountToFetch >= amountToFetch) {
      setCommentsFetched(commentsFetched - amountToFetch)
    }
  }

  const changeOrder = (order) => {
    setCommentOrder(order)

    fetchMore({
      variables: {
        first: getCommentsData.findCommentsByPost.length,
        after: 0,
        order: order
      }
    })
  }

  return (
    <div id="page">
      {message && <Modal text={message} setMessage={setMessage} />}

      <div id="postInfo">
        <p className='largeText postInfoItem'>
          <Link to={`/discussion/${discussion?.name}`}>
            {discussion?.name}
          </Link>
        </p>
        <p className="largeText postInfoItem">
          <Link to={`/user/${postUser?.username}`}>
            Post by {postUser?.username}
          </Link>
        </p>
      </div>

      <div className='post content'>
        <h3>{postTitle}</h3>
        <p>{postText}</p>
        {postImage &&
          <img id='postImage' alt="could not load content" src={postImage} />
        }
        <div className="postIcons">
          <VoteButtons
            id={postId} token={token}
            likes={postLikes} dislikes={postDislikes}
            hasLiked={userHasLikedPost} hasDisliked={userHasDislikedPost}
            likeFunction={likePost} unlikeFunction={unlikePost}
            dislikeFunction={dislikePost} undislikeFunction={undislikePost}
          />
          <div className="commentCountIcon">
            <i className="material-icons noHover" style={{ top: "7px", paddingRight: "10px" }}>message</i>{postCommentCount}
          </div>
        </div>
      </div>

      {token &&
        <CreateCommentForm
          postId={params.id}
          fetched={commentsFetched}
          setFetched={setCommentsFetched}
          postCreatorId={postUser.id}
          responseToComment={false}
          setMessage={setMessage}
        />
      }
      <p className='dividerHorizontal' />

      <div id='comments'>
        <div className='filterOptions'>
          <select name="order" onChange={({ target }) => changeOrder(target.value)}>
            <option value="NEW">New Comments</option>
            <option value="OLD">Old Comments</option>
            <option value="LIKES">Most Likes</option>
            <option value="DISLIKES">Most Dislikes</option>
          </select>
        </div>

        {comments?.map(comment =>
          <Comment
            key={comment.id} postId={params.id}
            postCreatorId={postUser.id}
            comment={comment} token={token}
            fetched={commentsFetched} setFetched={setCommentsFetched}
            setMessage={setMessage}
          />
        )}

        <div className="controlAmountButtons">
          <button id="fetchMoreButton" onClick={() => fetchMoreComments()}>Show More</button>
          <button onClick={showLess}>Show Less</button>
        </div>
      </div>
    </div>
  )
}

export default PostPage