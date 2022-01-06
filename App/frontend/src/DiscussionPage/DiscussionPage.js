import React, { useEffect, useState } from 'react'
import { useLazyQuery, useMutation } from '@apollo/client'
import { useParams, Link } from 'react-router-dom'

import { FIND_DISCUSSION } from '../queries'
import {
  LIKE_POST,
  DISLIKE_POST,
  SUBSCRIBE_TO_DISCUSSION,
  UNSUBSCRIBE_FROM_DISCUSSION
} from '../mutations'

import CreatePostForm from './CreatePostForm'

const DiscussionPage = ({ token }) => {
  const [discussionName, setDiscussionName] = useState(null)
  const [discussionMembers, setDiscussionMembers] = useState(null)
  const [posts, setPosts] = useState(null)
  const [listOfMembers, setListOfMembers] = useState(null)
  const [userIsSubscribed, setUserIsSubscribed] = useState(false)

  let params = useParams()

  const [getDiscussion, { data }] = useLazyQuery(FIND_DISCUSSION, {
    fetchPolicy: 'cache-and-network'
  })

  const [likePost] = useMutation(LIKE_POST, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    },
    refetchQueries: [{ query: FIND_DISCUSSION, variables: { name: params.name } }]
  })

  const [dislikePost] = useMutation(DISLIKE_POST, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    },
    refetchQueries: [{ query: FIND_DISCUSSION, variables: { name: params.name } }]
  })

  const [subscribeToDiscussion] = useMutation(SUBSCRIBE_TO_DISCUSSION, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    },
    refetchQueries: [{ query: FIND_DISCUSSION, variables: { name: params.name } }]
  })

  const [unsubscribeFromDiscussion] = useMutation(UNSUBSCRIBE_FROM_DISCUSSION, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    },
    refetchQueries: [{ query: FIND_DISCUSSION, variables: { name: params.name } }]
  })

  useEffect(() => {
    getDiscussion({ variables: { name: params.name } })
  }, [params.name]) //eslint-disable-line

  //set the values for accessing data
  useEffect(() => {
    if (data?.findDiscussion) {
      setDiscussionName(data.findDiscussion.name)
      setDiscussionMembers(data.findDiscussion.members)
      setPosts(data.findDiscussion.posts)
      setListOfMembers(data.findDiscussion.listOfMembers)
    }
  }, [data?.findDiscussion])

  //check if user is subscribed and show subscribe buttons accordingly
  //but only when user is logged in
  useEffect(() => {
    if (listOfMembers && token) {
      const memberNames = listOfMembers.map(user => user.username)
      setUserIsSubscribed(memberNames.includes(localStorage.getItem('username')))
    }
  }, [listOfMembers, token])

  const like = (id) => {
    likePost({ variables: { id } })
  }
  
  const dislike = (id) => {
    dislikePost({ variables: { id } })
  }

  const subscribe = (discussionName) => {
    subscribeToDiscussion({ variables: { discussionName } })
  }

  const unsubscribe = (discussionName) => {
    unsubscribeFromDiscussion({ variables: { discussionName } })
  }

  return (
    <div>
      <h1>Discussion Page</h1>
      <div>
        <h3>{discussionName}</h3>
        <h4>members: {discussionMembers}</h4>
        {token && // only show when user is logged in
          <div id="subscription_selection">
            {userIsSubscribed
              ? //if is subscribed, show unsubscribe
              <button onClick={() => unsubscribe(discussionName)}>
                Unsubscribe
              </button>
              : //if isn't subscribed, show subscribe
              <button onClick={() => subscribe(discussionName)}>
                Subscribe
              </button>
            }
          </div>}
        <h3>Posts</h3>
        <table id="posts">
          <tbody>
            <tr>
              <th>Title</th>
              <th>Text</th>
              <th>Likes</th>
              <th>Dislikes</th>
            </tr>
            {posts?.map(post =>
              <tr key={post.id}>
                <td><Link to={`/post/${post.id}`}>{post.title}</Link> |</td>
                <td>{post.text} |</td>
                <td>{post.likes} |</td>
                <td>{post.dislikes}</td>
              </tr>
            )}
          </tbody>
        </table>
        {token &&
          <CreatePostForm
            discussionName={params.name}
          />}
      </div>
    </div>
  )
}

export default DiscussionPage