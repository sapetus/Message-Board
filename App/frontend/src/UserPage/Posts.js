import React, { useEffect, useState } from 'react'
import { useLazyQuery } from '@apollo/client'
import { Link } from 'react-router-dom'

import { GET_POSTS_BY_USER } from '../GraphQL/queries'

const Posts = ({ username, amountToFetch, showLess }) => {
  const [posts, setPosts] = useState(null)
  const [postsFetched, setPostsFetched] = useState(0)

  const [getPostsByUser, { data: getPostsByUserData, fetchMore }] = useLazyQuery(
    GET_POSTS_BY_USER,
    { fetchPolicy: 'cache-and-network' }
  )

  useEffect(() => {
    setPostsFetched(amountToFetch)
    getPostsByUser({ variables: { username, first: amountToFetch, order: "NEW" } })
  }, [username]) //eslint-disable-line

  useEffect(() => {
    if (getPostsByUserData?.findPostsByUser) {
      setPosts(getPostsByUserData.findPostsByUser.slice(0, postsFetched))
    }
  }, [getPostsByUserData, postsFetched])

  const fetchPosts = async (event) => {
    event.preventDefault()

    const { data } = await fetchMore({
      variables: {
        username: username,
        first: amountToFetch,
        after: getPostsByUserData.findPostsByUser.length
      }
    })

    if ((data?.findPostsByUser.length + getPostsByUserData.findPostsByUser.length) > postsFetched) {
      setPostsFetched(postsFetched + amountToFetch)
    }
  }

  return (
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
      <button onClick={fetchPosts}>Show More</button>
      <button onClick={() => showLess(postsFetched, setPostsFetched)}>Show Less</button>
    </div>
  )
}

export default Posts