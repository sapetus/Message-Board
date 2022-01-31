import React, { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom'

import { ALL_DISCUSSIONS } from '../GraphQL/queries'

import CreateDiscussionForm from './CreateDiscussionForm';

const LandingPage = ({ token }) => {
  const [discussions, setDiscussions] = useState(null)
  const [discussionsFetched, setDiscussionsFetched] = useState(0)
  const [discussionOrder, setDiscussionOrder] = useState('NEW')

  const amountToFetch = 5

  const { data: discussionData, fetchMore } = useQuery(
    ALL_DISCUSSIONS,
    {
      fetchPolicy: "cache-and-network",
      variables: { first: amountToFetch, order: discussionOrder }
    }
  )

  useEffect(() => {
    setDiscussionsFetched(amountToFetch)
  }, []) //eslint-disable-line

  useEffect(() => {
    if (discussionData?.allDiscussions) {
      setDiscussions(discussionData.allDiscussions.slice(0, discussionsFetched))
    }
  }, [discussionData?.allDiscussions, discussionsFetched])

  const fetchDiscussions = async (event) => {
    event.preventDefault()

    const { data } = await fetchMore({
      variables: {
        first: amountToFetch,
        after: discussionData.allDiscussions.length,
        order: discussionOrder
      }
    })

    if (data.allDiscussions.length + discussionData.allDiscussions.length > discussionsFetched) {
      setDiscussionsFetched(discussionsFetched + amountToFetch)
    }
  }

  const showLess = () => {
    if (discussionsFetched - amountToFetch >= amountToFetch) {
      setDiscussionsFetched(discussionsFetched - amountToFetch)
    }
  }

  const changeOrder = async (order) => {
    setDiscussionOrder(order)

    fetchMore({
      variables: {
        first: discussionData.allDiscussions.length,
        after: 0,
        order: order
      }
    })
  }

  return (
    <div id="landingPage">
      <h1>Landing Page</h1>
      <label>Order</label>
      <select name="order" onChange={({ target }) => changeOrder(target.value)}>
        <option value="NEW">New</option>
        <option value="OLD">Old</option>
        <option value="MEMBERS">Most members</option>
        <option value="ALPHABETICAL">Alphabetical</option>
      </select>
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
      <button onClick={fetchDiscussions}>Show More</button>
      <button onClick={showLess}>Show Less</button>
      {token && <CreateDiscussionForm />}
    </div>
  )
}

export default LandingPage