import React, { useEffect, useState } from 'react'
import { useLazyQuery } from '@apollo/client'
import { useParams, Link } from 'react-router-dom'

import { GET_USER_BY_NAME } from '../GraphQL/queries'

const UserPage = (props) => {
  const [username, setUsername] = useState('')
  const [posts, setPosts] = useState(null)
  const [comments, setComments] = useState(null)
  const [memberOf, setMemberOf] = useState(null)
  const [totalLikes, setTotalLikes] = useState(0)
  const [totalDislikes, setTotalDislikes] = useState(0)

  let params = useParams()

  const [getUser, { data }] = useLazyQuery(GET_USER_BY_NAME, {
    fetchPolicy: 'cache-and-network'
  })

  useEffect(() => {
    getUser({ variables: { username: params.username } })
  }, [params.username]) //eslint-disable-line

  useEffect(() => {
    if (data?.getUserByName) {
      const userData = data.getUserByName
      setUsername(userData.username)
      setPosts(userData.posts)
      setComments(userData.comments)
      setMemberOf(userData.memberOf)
      setTotalLikes(userData.totalLikes)
      setTotalDislikes(userData.totalDislikes)
    }
  }, [data])

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
      </div>
    </div>
  )
}

export default UserPage