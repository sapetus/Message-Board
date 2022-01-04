import React, { useEffect, useState } from 'react'
import { useLazyQuery } from '@apollo/client'

import { GET_USER } from '../queries'

const UserPage = (props) => {
  const [username, setUsername] = useState('')
  const [posts, setPosts] = useState(null)
  const [comments, setComments] = useState(null)
  const [memberOf, setMemberOf] = useState(null)

  const [getUser, { data }] = useLazyQuery(GET_USER, {
    fetchPolicy: 'cache-and-network'
  })

  useEffect(() => {
    getUser()
  }, []) //eslint-disable-line

  useEffect(() => {
    if (data?.getUser) {
      setUsername(data.getUser.username)
      setPosts(data.getUser.posts)
      setComments(data.getUser.comments)
      setMemberOf(data.getUser.memberOf)
    }
  }, [data])

  return (
    <div>
      <h1>User Page</h1>
      <h3>User: {username}</h3>
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
                <td>{post.discussion.name}</td>
                <td>{post.title}</td>
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
                <td>{comment.post.title}</td>
                <td>{comment.text}</td>
                <td>{comment.likes}</td>
                <td>{comment.dislikes}</td>
                <td>{comment.post.discussion.name}</td>
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
                <td>{discussion.name}</td>
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