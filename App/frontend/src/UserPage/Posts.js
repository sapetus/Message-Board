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

  const style = {
    vote: {
      padding: "0px 10px 15px 10px"
    },
    text: {
      margin: "0px",
      padding: "10px 0px"
    }
  }
  
  if (posts?.length > 0) {
    return (
      <div id="userPosts">
        {posts?.map(post =>
          <Link key={post.id} className='post' to={`/post/${post.id}`}>
            <p className='smallText' style={style.text}>{post.discussion.name}</p>
            <h3 style={style.text}>{post.title}</h3>
            <p className='longText'>{post.text}</p>
            <div className='votes'>
              <i className="material-icons vote">thumb_up</i>{post.likes}
              <i className="material-icons vote">thumb_down</i>{post.dislikes}
              <i className='material-icons message'>message</i>{post.amountOfComments}
            </div>
          </Link>
        )}

        {posts &&
          <div className="controlAmountButtons">
            <button onClick={fetchPosts}>Show More</button>
            <button onClick={() => showLess(postsFetched, setPostsFetched)}>Show Less</button>
          </div>
        }
      </div>
    )
  }

  return (
    <div id="userPosts">
      <p>This user has no posts, yet!</p>
    </div>
  )
}

export default Posts