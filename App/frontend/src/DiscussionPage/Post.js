import React from 'react'
import { Link } from 'react-router-dom'

const Post = ({ post }) => {
  return (
    <Link key={post.id} className="post" to={`/post/${post.id}`}>
      <h3>{post.title}</h3>
      <p className='longText'>{post.text}</p>
      <div className="votes">
        <i className="material-icons vote">thumb_up</i>{post.likes}
        <i className="material-icons vote">thumb_down</i>{post.dislikes}
        <i className="material-icons message">message</i>{post.amountOfComments}
      </div>
    </Link>
  )
}

export default Post