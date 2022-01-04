import React, { useEffect, useState } from 'react'
import { useLazyQuery, useMutation } from '@apollo/client'
import { useParams, Link } from 'react-router-dom'

import { FIND_DISCUSSION } from '../queries'
import { LIKE_POST, DISLIKE_POST } from '../mutations'

import CreatePostForm from './CreatePostForm'

const DiscussionPage = ({ token }) => {
  const [discussion, setDiscussion] = useState(null)

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

  useEffect(() => {
    getDiscussion({ variables: { name: params.name } })
  }, [params.name]) //eslint-disable-line

  useEffect(() => {
    if (data?.findDiscussion) {
      setDiscussion(data.findDiscussion)
    }
  }, [data?.findDiscussion])

  const like = (id) => {
    likePost({ variables: { id } })
  }
  const dislike = (id) => {
    dislikePost({ variables: { id } })
  }

  return (
    <div>
      <h1>Discussion Page</h1>
      <div>
        <h3>{discussion?.name}</h3>
        <h4>members: {discussion?.members}</h4>
        <h3>Posts</h3>
        <table id="posts">
          <tbody>
            <tr>
              <th>Title</th>
              <th>Text</th>
              <th>Likes</th>
              <th>Dislikes</th>
            </tr>
            {discussion?.posts.map(post =>
              <tr key={post.id}>
                <td><Link to={`/post/${post.id}`}>{post.title}</Link> |</td>
                <td>{post.text} |</td>
                <td>{post.likes} |</td>
                <td>{post.dislikes}</td>
                {token && <td><button onClick={() => like(post.id)}>Like</button></td>}
                {token && <td><button onClick={() => dislike(post.id)}>Dislike</button></td>}
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