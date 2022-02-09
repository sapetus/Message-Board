import React from 'react'

import { Link } from 'react-router-dom'

const Discussion = ({ discussion }) => {
  return (
    <Link className='discussion' to={`/discussion/${discussion.name}`}>
      <div>
        <h4>
          {discussion.name} &nbsp;&nbsp;&nbsp;
          <i className='material-icons member'>group</i>{discussion.members}
        </h4>
        <p className='longText'>{discussion?.description}</p>
      </div>
    </Link >
  )
}

export default Discussion