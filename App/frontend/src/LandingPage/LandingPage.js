import React, { useEffect, useState } from 'react'
import { useLazyQuery } from '@apollo/client';
import {
  Link
} from 'react-router-dom'

import { ALL_DISCUSSIONS } from '../queries'

import CreateDiscussionForm from './CreateDiscussionForm';

const LandingPage = (props) => {
  const [getAllDiscussions, { loading, data }] = useLazyQuery(ALL_DISCUSSIONS)
  const [discussions, setDiscussion] = useState(null)

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
      {loading
        ? <div>Loading...</div>
        : <table id="discussions">
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
      }
      <CreateDiscussionForm
        updateDiscussions={getAllDiscussions}
      />
    </div>
  )
}

export default LandingPage