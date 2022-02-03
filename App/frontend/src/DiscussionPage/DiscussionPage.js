import React, { useEffect, useState } from 'react'
import { useLazyQuery, useQuery, useMutation } from '@apollo/client'
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
  const [discussionDescription, setDiscussionDescription] = useState(null)
  const [discussionMembers, setDiscussionMembers] = useState(null)
  const [posts, setPosts] = useState(null)
  const [listOfMembers, setListOfMembers] = useState(null)
  const [userIsSubscribed, setUserIsSubscribed] = useState(false)
  const [postsFetched, setPostsFetched] = useState(0)
  const [postOrder, setPostOrder] = useState('NEW')
  const [searchString, setSearchString] = useState('')
  const [timeoutId, setTimeoutId] = useState(null)

  let params = useParams()
  const amountToFetch = 5

  const [getDiscussion, { data: getDiscussionData }] = useLazyQuery(
    FIND_DISCUSSION,
    { fetchPolicy: 'cache-and-network' }
  )

  const { data: getPostsData, fetchMore } = useQuery(
    GET_POSTS_BY_DISCUSSION,
    {
      fetchPolicy: 'cache-and-network',
      variables: { name: params.name, first: amountToFetch, order: postOrder, filter: searchString }
    }
  )

  const [subscribeToDiscussion] = useMutation(
    SUBSCRIBE_TO_DISCUSSION,
    {
      onError: (error) => {
        console.log(error.graphQLErrors[0].message)
      },
      refetchQueries: [{ query: FIND_DISCUSSION, variables: { name: params.name } }]
    }
  )

  const [unsubscribeFromDiscussion] = useMutation(
    UNSUBSCRIBE_FROM_DISCUSSION,
    {
      onError: (error) => {
        console.log(error.graphQLErrors[0].message)
      },
      refetchQueries: [{ query: FIND_DISCUSSION, variables: { name: params.name } }]
    }
  )

  useEffect(() => {
    setPostsFetched(amountToFetch)

    getDiscussion({ variables: { name: params.name } })
  }, [params.name]) //eslint-disable-line

  useEffect(() => {
    if (getDiscussionData?.findDiscussion) {
      const data = getDiscussionData.findDiscussion
      setDiscussionDescription(data.description)
      setDiscussionName(data.name)
      setDiscussionMembers(data.members)
      setListOfMembers(data.listOfMembers)
    }
  }, [getDiscussionData?.findDiscussion])

  useEffect(() => {
    if (getPostsData?.findPostsByDiscussion) {
      setPosts(getPostsData.findPostsByDiscussion.slice(0, postsFetched))
    }
  }, [getPostsData?.findPostsByDiscussion, postsFetched])

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

    const { data } = await fetchMore({
      variables: {
        name: params.name,
        first: amountToFetch,
        after: getPostsData.findPostsByDiscussion.length
      }
    })

    if (data.findPostsByDiscussion.length + getPostsData.findPostsByDiscussion.length > postsFetched) {
      setPostsFetched(postsFetched + amountToFetch)
    }
  }

  const showLess = () => {
    if (postsFetched - amountToFetch >= amountToFetch) {
      setPostsFetched(postsFetched - amountToFetch)
    }
  }

  const changeOrder = (order) => {
    setPostOrder(order)

    fetchMore({
      variables: {
        first: getPostsData.findPostsByDiscussion.length,
        after: 0,
        order: order
      }
    })
  }

  const onSearchChange = (filter) => {
    clearTimeout(timeoutId)

    setTimeoutId(
      setTimeout(() => {
        setSearchString(filter)
      }, 1000)
    )
  }

  return (
    <div>
      <h1>Discussion Page</h1>
      <h3>{discussionName}</h3>
      <p>{discussionDescription}</p>
      <h4>members: {discussionMembers}</h4>
      {token && // only show when user is logged in
        <div id="subscription_selection">
          {userIsSubscribed
            ? //if is subscribed, show unsubscribe
            <button className='activeButton' onClick={() => unsubscribe(discussionName)}>
              Unsubscribe
            </button>
            : //if isn't subscribed, show subscribe
            <button className="inactiveButton" onClick={() => subscribe(discussionName)}>
              Subscribe
            </button>
          }
        </div>}

      <h3>Posts</h3>
      <label>Search</label>
      <input onChange={({ target }) => onSearchChange(target.value)} />
      <br />
      <label>Order</label>
      <select name="order" onChange={({ target }) => changeOrder(target.value)}>
        <option value="NEW">New</option>
        <option value="OLD">Old</option>
        <option value="LIKES">Likes</option>
        <option value="DISLIKES">Dislikes</option>
      </select>
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
      <button onClick={fetchPosts}>Show More</button>
      <button onClick={showLess}>Show Less</button>

      {token &&
        <CreatePostForm
          discussionName={params.name}
          order={postOrder}
        />}
    </div>
  )
}

export default DiscussionPage