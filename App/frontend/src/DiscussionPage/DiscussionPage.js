import React, { useEffect, useState } from 'react'
import { useLazyQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

import { FIND_DISCUSSION } from '../queries'

import CreatePostForm from './CreatePostForm'

const DiscussionPage = (props) => {
  let params = useParams();
  const [getDiscussion, { loading, data }] = useLazyQuery(FIND_DISCUSSION)
  const [discussion, setDiscussion] = useState(null)

  useEffect(() => {
    getDiscussion({ variables: { name: params.name } })
  }, [params.name]) //eslint-disable-line

  useEffect(() => {
    if (data?.findDiscussion) {
      setDiscussion(data.findDiscussion)
    }
  }, [data?.findDiscussion])

  return (
    <div>
      <h1>Discussion Page</h1>
      {loading
        ? <div>
          <p>loading</p>
        </div>
        : <div>
          <h3>{discussion?.name}</h3>
          <h4>members: {discussion?.members}</h4>
          <table id="posts">
            <tbody>
              <tr>
                <th>Posts</th>
              </tr>
              <tr>
                <th>Title</th>
                <th>Text</th>
                <th>Likes</th>
                <th>Dislikes</th>
              </tr>
              {discussion?.posts.map(post =>
                <tr key={post.id}>
                  <td>{post.title}</td>
                  <td>{post.text}</td>
                  <td>{post.likes}</td>
                  <td>{post.dislikes}</td>
                </tr>
              )}
            </tbody>
          </table>
          <CreatePostForm
            discussionName={params.name}
            updateDiscussion={getDiscussion}
          />
        </div>
      }
    </div>
  )
}

export default DiscussionPage