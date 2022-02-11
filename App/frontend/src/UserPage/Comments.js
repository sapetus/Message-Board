import React, { useState, useEffect } from 'react'
import { useLazyQuery } from '@apollo/client'
import { Link } from 'react-router-dom'

import { GET_COMMENTS_BY_USER } from '../GraphQL/queries'

const Comments = ({ username, amountToFetch, showLess }) => {
  const [comments, setComments] = useState(null)
  const [commentsFetched, setCommentsFetched] = useState(0)

  const [getCommentsByUser, { data: getCommentsByUserData, fetchMore }] = useLazyQuery(
    GET_COMMENTS_BY_USER,
    { fetchPolicy: 'cache-and-network' }
  )

  useEffect(() => {
    setCommentsFetched(amountToFetch)
    getCommentsByUser({ variables: { username, first: amountToFetch, order: "NEW" } })
  }, [username]) //eslint-disable-line

  useEffect(() => {
    if (getCommentsByUserData?.findCommentsByUser) {
      setComments(getCommentsByUserData.findCommentsByUser.slice(0, commentsFetched))
    }
  }, [getCommentsByUserData, commentsFetched])

  const fetchComments = async (event) => {
    event.preventDefault()

    const { data } = await fetchMore({
      variables: {
        username,
        first: amountToFetch,
        after: getCommentsByUserData.findCommentsByUser.length
      }
    })

    if ((data?.findCommentsByUser.length + getCommentsByUserData.findCommentsByUser.length) > commentsFetched) {
      setCommentsFetched(commentsFetched + amountToFetch)
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

  return (
    <div id="userComments">
      {comments?.map(comment =>
        <Link key={comment.id} className="comment" to={`/post/${comment.post.id}`}>
          <p className='smallText' style={style.text}>{comment.post.discussion.name}</p>
          <p className='smallText' style={style.text}>{comment.post.title}</p>
          <h3 style={style.text}>{comment.text}</h3>
          <div className='votes'>
            <i className="material-icons" style={style.vote}>thumb_up</i>{comment.likes}
            <i className="material-icons" style={style.vote}>thumb_down</i>{comment.dislikes}
          </div>
        </Link>
      )}

      {comments &&
        <div className="controlAmountButtons">
          <button onClick={fetchComments}>Show More</button>
          <button onClick={() => showLess(commentsFetched, setCommentsFetched)}>Show less</button>
        </div>
      }
    </div>
  )
}

export default Comments