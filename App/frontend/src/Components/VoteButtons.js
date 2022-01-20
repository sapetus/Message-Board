import React, { useState } from 'react'

const VoteButtons = ({
  id, token,
  hasLiked, hasDisliked,
  likeFunction, unlikeFunction,
  dislikeFunction, undislikeFunction
}) => {
  //stupid way to block user from voting again too fast
  const [wait, setWait] = useState(false)

  const like = () => {
    if (!wait) {
      likeFunction({ variables: { id } })
      setWait(true)
      setTimeout(() => {
        setWait(false)
      }, 1000)
    }
  }

  const unlike = () => {
    if (!wait) {
      unlikeFunction({ variables: { id } })
      setWait(true)
      setTimeout(() => {
        setWait(false)
      }, 1000)
    }
  }

  const dislike = () => {
    if (!wait) {
      dislikeFunction({ variables: { id } })
      setWait(true)
      setTimeout(() => {
        setWait(false)
      }, 1000)
    }
  }

  const undislike = () => {
    if (!wait) {
      undislikeFunction({ variables: { id } })
      setWait(true)
      setTimeout(() => {
        setWait(false)
      }, 1000)
    }
  }

  return (
    <p className="vote_button">
      {token &&
        (hasLiked
          ? <button onClick={() => unlike()} style={{ backgroundColor: "orange" }}>Unlike</button>
          : <button onClick={() => like()}>Like</button>)
      }
      {token &&
        (hasDisliked
          ? <button onClick={() => undislike()} style={{ backgroundColor: "orange" }}>Undislike</button>
          : <button onClick={() => dislike()}>Dislike</button>)
      }
    </p>
  )
}

export default VoteButtons