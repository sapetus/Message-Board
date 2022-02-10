import React, { useEffect, useState } from 'react'

const VoteButtons = ({
  id, token,
  likes, dislikes,
  hasLiked, hasDisliked,
  likeFunction, unlikeFunction,
  dislikeFunction, undislikeFunction
}) => {
  //?stupid? way to block user from voting again too fast
  const [wait, setWait] = useState(false)
  let currentTimeoutId = null
  const waitTime = 1000

  //this appears get rid of the 'Can't perform state update on an unmounted component' -error
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

  const styles = {
    icon: {
      top: "4px",
      paddingRight: "8px"
    },
    x: {
      marginTop: "5px"
    }
  }

  if (!token) {
    //if no token is provided (user is not logged in), only show current votes but dont allow voting
    return (
      <div className='voteButtons' style={styles.x}>
        <i className="material-icons vote noHover">thumb_up</i>{likes} &nbsp;&nbsp;
        <i className="material-icons vote noHover">thumb_down</i>{dislikes} &nbsp;&nbsp;
      </div>
    )
  } else {
    return (
      <div className="voteButtons">
        {hasLiked
          ? <div>
            <i className="material-icons activeButton" onClick={() => vote(unlikeFunction)} style={styles.icon}>
              thumb_up
            </i>
            {likes} &nbsp;&nbsp;
          </div>
          : <div>
            <i className="material-icons inactiveButton" onClick={() => vote(likeFunction)} style={styles.icon}>
              thumb_up
            </i>
            {likes} &nbsp;&nbsp;
          </div>
        }
        {hasDisliked
          ? <div>
            <i className="material-icons activeButton" onClick={() => vote(undislikeFunction)} style={styles.icon}>
              thumb_down
            </i>
            {dislikes} &nbsp;&nbsp;
          </div>
          : <div>
            <i className="material-icons inactiveButton" onClick={() => vote(dislikeFunction)} style={styles.icon}>
              thumb_down
            </i>
            {dislikes} &nbsp;&nbsp;
          </div>
        }
      </div>
    )
  }
}

export default VoteButtons