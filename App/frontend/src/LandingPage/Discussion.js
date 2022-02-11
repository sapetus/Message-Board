import React from 'react'

import { Link } from 'react-router-dom'

const Discussion = ({ discussion }) => {
  return (
    <Link className='discussion' to={`/discussion/${discussion.name}`}>
      <div className='discussionSubContainer'>
        <h4>{discussion.name}</h4>
        <h4><i className='material-icons member'>group</i>{discussion.members}</h4>
      </div>
      <p className='longText'>{discussion?.description}</p>
    </Link >
  )
}

export default Discussion