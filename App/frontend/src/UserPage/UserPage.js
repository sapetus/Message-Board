import React, { useEffect, useState } from 'react'
import { useLazyQuery } from '@apollo/client'
import { useParams, Link } from 'react-router-dom'

import {
  GET_USER_BY_NAME,
  GET_POSTS_BY_USER,
  GET_COMMENTS_BY_USER,
  GET_DISCUSSIONS_USER_SUBSCRIBED_TO
} from '../GraphQL/queries'

const UserPage = (props) => {
  const [username, setUsername] = useState('')
  const [posts, setPosts] = useState(null)
  const [comments, setComments] = useState(null)
  const [memberOf, setMemberOf] = useState(null)
  const [totalLikes, setTotalLikes] = useState(0)
  const [totalDislikes, setTotalDislikes] = useState(0)
  const [postsFetched, setPostsFetched] = useState(0)
  const [commentsFetched, setCommentsFetched] = useState(0)
  const [subscriptionsFetched, setSubscriptionsFetched] = useState(0)

  let params = useParams()
  const amountToFetch = 5

  const [getUser, { data: getUserData }] = useLazyQuery(GET_USER_BY_NAME, {
    fetchPolicy: 'cache-and-network'
  })

  const [getPostsByUser, { data: getPostsByUserData, fetchMore: fetchMorePosts }] = useLazyQuery(GET_POSTS_BY_USER, {
    fetchPolicy: 'cache-and-network'
  })

  const [getCommentsByUser, { data: getCommentsByUserData, fetchMore: fetchMoreComments }] = useLazyQuery(GET_COMMENTS_BY_USER, {
    fetchPolicy: 'cache-and-network'
  })

  const [getMemberOf, { data: getMemberOfData, fetchMore: fetchMoreSubscriptions }] = useLazyQuery(GET_DISCUSSIONS_USER_SUBSCRIBED_TO, {
    fetchPolicy: 'cache-and-network'
  })

  //get the first 'amountToFetch' of each
  //amount of fetched items is reset back to 'amountToFetch' when page is revisited
  //if page is left and returned to, and user has created e.g. a new post, 
  //user must click get more posts multiple times to get that post
  //need to change read functions of each query?
  useEffect(() => {
    getUser({ variables: { username: params.username } })
    getPostsByUser({ variables: { username: params.username, first: amountToFetch } })
    getCommentsByUser({ variables: { username: params.username, first: amountToFetch } })
    getMemberOf({ variables: { username: params.username, first: amountToFetch } })

    setPostsFetched(amountToFetch)
    setCommentsFetched(amountToFetch)
    setSubscriptionsFetched(amountToFetch)
  }, [params.username]) //eslint-disable-line

  useEffect(() => {
    if (getUserData?.getUserByName) {
      const userData = getUserData.getUserByName
      setUsername(userData.username)
      setTotalLikes(userData.totalLikes)
      setTotalDislikes(userData.totalDislikes)
    }
  }, [getUserData])

  useEffect(() => {
    if (getPostsByUserData?.findPostsByUser) {
      setPosts(getPostsByUserData.findPostsByUser)
    }
  }, [getPostsByUserData])

  useEffect(() => {
    if (getCommentsByUserData?.findCommentsByUser) {
      setComments(getCommentsByUserData.findCommentsByUser)
    }
  }, [getCommentsByUserData])

  useEffect(() => {
    if (getMemberOfData?.findDiscussionsUserHasSubscribedTo) {
      setMemberOf(getMemberOfData.findDiscussionsUserHasSubscribedTo)
    }
  }, [getMemberOfData])

  const fetchSubscriptions = async (event) => {
    event.preventDefault()

    const { data } = await fetchMoreSubscriptions({
      variables: {
        username: params.username,
        first: amountToFetch,
        after: subscriptionsFetched
      }
    })

    const dataLength = data.findDiscussionsUserHasSubscribedTo.length

    if (dataLength > 0) {
      setSubscriptionsFetched(subscriptionsFetched + dataLength)
    }
  }

  const fetchPosts = async (event) => {
    event.preventDefault()

    const { data } = await fetchMorePosts({
      variables: {
        username: params.username,
        first: amountToFetch,
        after: postsFetched
      }
    })

    const dataLength = data.findPostsByUser.length

    if (dataLength > 0) {
      setPostsFetched(postsFetched + dataLength)
    }
  }

  const fetchComments = async (event) => {
    event.preventDefault()

    const { data } = await fetchMoreComments({
      variables: {
        username: params.username,
        first: amountToFetch,
        after: commentsFetched
      }
    })

    const dataLength = data.findCommentsByUser.length

    if (dataLength > 0) {
      setCommentsFetched(commentsFetched + dataLength)
    }
  }

  return (
    <div>
      <h1>User Page</h1>
      <h3>User: {username}</h3>
      <h4>Likes: {totalLikes} | Dislikes: {totalDislikes}</h4>

      <div id="user_posts">
        <h3>Posts</h3>
        <table>
          <tbody>
            <tr>
              <th>Discussion</th>
              <th>Title</th>
              <th>Likes</th>
              <th>Dislike</th>
            </tr>
            {posts?.map(post =>
              <tr key={post.id}>
                <td><Link to={`/discussion/${post.discussion.name}`}>{post.discussion.name}</Link></td>
                <td><Link to={`/post/${post.id}`}>{post.title}</Link></td>
                <td>{post.likes}</td>
                <td>{post.dislikes}</td>
              </tr>
            )}
          </tbody>
        </table>
        <button onClick={fetchPosts}>Get More Posts</button>
      </div>

      <div id="user_comments">
        <h3>Comments</h3>
        <table>
          <tbody>
            <tr>
              <th>Post</th>
              <th>Text</th>
              <th>Likes</th>
              <th>Dislikes</th>
              <th>Discussion</th>
            </tr>
            {comments?.map(comment =>
              <tr key={comment.id}>
                <td><Link to={`/post/${comment.post.id}`}>{comment.post.title}</Link></td>
                <td>{comment.text}</td>
                <td>{comment.likes}</td>
                <td>{comment.dislikes}</td>
                <td><Link to={`/discussion/${comment.post.discussion.name}`}>{comment.post.discussion.name}</Link></td>
              </tr>
            )}
          </tbody>
        </table>
        <button onClick={fetchComments}>Get More Comments</button>
      </div>

      <div id="user_subscriptions">
        <h3>Subscriptions</h3>
        <table>
          <tbody>
            <tr>
              <th>Discussion</th>
              <th>Members</th>
            </tr>
            {memberOf?.map(discussion =>
              <tr key={discussion.id}>
                <td><Link to={`/discussion/${discussion.name}`}>{discussion.name}</Link></td>
                <td>{discussion.members}</td>
              </tr>
            )}
          </tbody>
        </table>
        <button onClick={fetchSubscriptions}>Get More Subscriptions</button>
      </div>
    </div>
  )
}

export default UserPage