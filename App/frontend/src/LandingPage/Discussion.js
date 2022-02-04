import React from 'react'

import { Link } from 'react-router-dom'

const Discussion = ({ discussion }) => {
  return (
    <Link className='discussion' to={`/discussion/${discussion.name}` }>
      <div>
        <h4>{discussion.name} | members: {discussion.members}</h4>
        <p className='discussionDescription'>{discussion?.description}</p>
      </div>
    </Link >
  )
}

export default Discussion