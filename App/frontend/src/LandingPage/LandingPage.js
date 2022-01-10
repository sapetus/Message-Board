import React, { useEffect, useState } from 'react'
import { useLazyQuery } from '@apollo/client';
import { Link } from 'react-router-dom'

import { ALL_DISCUSSIONS } from '../GraphQL/queries'

import CreateDiscussionForm from './CreateDiscussionForm';

const LandingPage = ({ token }) => {
  const [discussions, setDiscussion] = useState(null)

  const [getAllDiscussions, { data }] = useLazyQuery(ALL_DISCUSSIONS, {
    fetchPolicy: 'cache-and-network'
  })

  useEffect(() => {
    getAllDiscussions()
  }, []) //eslint-disable-line

  useEffect(() => {
    if (data?.allDiscussions) {
      setDiscussion(data.allDiscussions)
    }
  }, [data?.allDiscussions])

  return (
    <div id="landingPage">
      <h1>Landing Page</h1>
      <table id="discussions">
        <tbody>
          <tr>
            <th>Discussion</th>
            <th>Members</th>
          </tr>
          {discussions?.map(discussion =>
            <tr key={discussion.name}>
              <td><Link to={`/discussion/${discussion.name}`}>{discussion.name}</Link></td>
              <td>{discussion.members}</td>
            </tr>
          )}
        </tbody>
      </table>
      {token && <CreateDiscussionForm
        updateDiscussions={getAllDiscussions}
      />}
    </div>
  )
}

export default LandingPage