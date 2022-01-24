import React, { useEffect, useState } from 'react'

const VoteButtons = ({
  id, token,
  hasLiked, hasDisliked,
  likeFunction, unlikeFunction,
  dislikeFunction, undislikeFunction
}) => {
  //?stupid? way to block user from voting again too fast
  const [wait, setWait] = useState(false)
  let currentTimeoutId = null
  const waitTime = 1000

  //this appears get rid of the 'Can't perform state update on an unmounted componen' -error
  useEffect(() => {
    let timeoutId = currentTimeoutId

    return () => {
      clearTimeout(timeoutId)
    }
  }, [currentTimeoutId])

  const vote = (voteFunction) => {
    if (!wait) {
      voteFunction({ variables: { id } })
      setWait(true)
      currentTimeoutId = setTimeout(() => {
        setWait(false)
      }, waitTime)
    }
  }

  return (
    <p className="vote_button">
      {token &&
        (hasLiked
          ? <button onClick={() => vote(unlikeFunction)} style={{ backgroundColor: "orange" }}>Unlike</button>
          : <button onClick={() => vote(likeFunction)}>Like</button>)
      }
      {token &&
        (hasDisliked
          ? <button onClick={() => vote(undislikeFunction)} style={{ backgroundColor: "orange" }}>Undislike</button>
          : <button onClick={() => vote(dislikeFunction)}>Dislike</button>)
      }
    </p>
  )
}

export default VoteButtons