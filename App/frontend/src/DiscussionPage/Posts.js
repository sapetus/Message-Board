import React, { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'

import { GET_POSTS_BY_DISCUSSION } from '../GraphQL/queries'
import Post from './Post'

const Posts = ({ name }) => {
  const [posts, setPosts] = useState(null)
  const [postsFetched, setPostsFetched] = useState(0)
  const [postOrder, setPostOrder] = useState('NEW')
  const [searchString, setSearchString] = useState('')
  const [timeoutId, setTimeoutId] = useState(null)

  const amountToFetch = 5;

  const { data: getPostsData, fetchMore } = useQuery(
    GET_POSTS_BY_DISCUSSION,
    {
      fetchPolicy: 'cache-and-network',
      variables: { name, first: amountToFetch, order: postOrder, filter: searchString }
    }
  )

  useEffect(() => {
    setPostsFetched(amountToFetch)
  }, [name])

  useEffect(() => {
    if (getPostsData?.findPostsByDiscussion) {
      setPosts(getPostsData.findPostsByDiscussion.slice(0, postsFetched))
    }
  }, [getPostsData?.findPostsByDiscussion, postsFetched])

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
      }, 700)
    )
  }

  const fetchPosts = async (event) => {
    event.preventDefault()

    const { data } = await fetchMore({
      variables: {
        name,
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

  return (
    <div id="discussionPosts">
      <div className="filterOptions">
        <div className="inputContainer">
          <i className="material-icons search">search</i>
          <input className="search"
            type='text'
            placeholder='Search...'
            onChange={({ target }) => onSearchChange(target.value)}
          />
        </div>
        <select name="order" onChange={({ target }) => changeOrder(target.value)}>
          <option value="NEW">New Posts</option>
          <option value="OLD">Old Posts</option>
          <option value="LIKES">Most Likes</option>
          <option value="DISLIKES">Most Dislikes</option>
        </select>
      </div>

      {posts?.map(post =>
        <Post key={post.id} post={post} />
      )}

      {posts &&
        <div className="controlAmountButtons">
          <button onClick={fetchPosts}>Show More</button>
          <button onClick={showLess}>Show Less</button>
        </div>
      }
    </div>
  )
}

export default Posts