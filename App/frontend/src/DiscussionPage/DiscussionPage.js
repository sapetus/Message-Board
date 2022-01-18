import React, { useEffect, useState } from 'react'
import { useLazyQuery, useMutation } from '@apollo/client'
import { useParams, Link } from 'react-router-dom'

import {
  FIND_DISCUSSION,
  GET_POSTS_BY_DISCUSSION
} from '../GraphQL/queries'
import {
  SUBSCRIBE_TO_DISCUSSION,
  UNSUBSCRIBE_FROM_DISCUSSION
} from '../GraphQL/mutations'

import CreatePostForm from './CreatePostForm'

const DiscussionPage = ({ token }) => {
  const [discussionName, setDiscussionName] = useState(null)
  const [discussionMembers, setDiscussionMembers] = useState(null)
  const [posts, setPosts] = useState(null)
  const [listOfMembers, setListOfMembers] = useState(null)
  const [userIsSubscribed, setUserIsSubscribed] = useState(false)

  let params = useParams()
  const amountToFetch = 5

  const [getDiscussion, { data: getDiscussionData }] = useLazyQuery(FIND_DISCUSSION, {
    fetchPolicy: 'cache-and-network'
  })

  const [getPosts, { data: getPostsData, fetchMore }] = useLazyQuery(GET_POSTS_BY_DISCUSSION, {
    fetchPolicy: 'cache-and-network'
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
    getPosts({ variables: { name: params.name, first: amountToFetch } })
  }, [params.name]) //eslint-disable-line

  useEffect(() => {
    if (getDiscussionData?.findDiscussion) {
      const data = getDiscussionData.findDiscussion
      setDiscussionName(data.name)
      setDiscussionMembers(data.members)
      setListOfMembers(data.listOfMembers)
    }
  }, [getDiscussionData?.findDiscussion])

  useEffect(() => {
    if (getPostsData?.findPostsByDiscussion) {
      setPosts(getPostsData.findPostsByDiscussion)
    }
  }, [getPostsData?.findPostsByDiscussion])

  //check if user is subscribed and show subscribe buttons accordingly
  //but only when user is logged in
  useEffect(() => {
    if (listOfMembers && token) {
      const memberNames = listOfMembers.map(user => user.username)
      setUserIsSubscribed(memberNames.includes(localStorage.getItem('username')))
    }
  }, [listOfMembers, token])

  const subscribe = (discussionName) => {
    subscribeToDiscussion({ variables: { discussionName } })
  }

  const unsubscribe = (discussionName) => {
    unsubscribeFromDiscussion({ variables: { discussionName } })
  }

  const fetchPosts = async (event) => {
    event.preventDefault()

    await fetchMore({
      variables: {
        name: params.name,
        first: amountToFetch,
        after: getPostsData.findPostsByDiscussion.length
      }
    })
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
              <button onClick={() => unsubscribe(discussionName)} style={{ backgroundColor: 'orange' }}>
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
        <button onClick={fetchPosts}>Get More Posts</button>
        {token &&
          <CreatePostForm
            discussionName={params.name}
          />}
      </div>
    </div>
  )
}

export default DiscussionPage