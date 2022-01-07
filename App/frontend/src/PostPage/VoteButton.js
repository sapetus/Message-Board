import React from 'react'

const VoteButton = ({
  id,
  token,
  status,
  voteText,
  unvoteText,
  voteFunction,
  unvoteFunction
}) => {
  return (
    <p className="vote_button">
      {token &&
        (status
          ? <button onClick={() => unvoteFunction(id)} style={{ backgroundColor: "orange" }}>{unvoteText}</button>
          : <button onClick={() => voteFunction(id)}>{voteText}</button>)
      }
    </p>
  )
}

export default VoteButton