import React, { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client';

import { ALL_DISCUSSIONS } from '../GraphQL/queries'

import CreateDiscussionForm from './CreateDiscussionForm';
import Discussion from './Discussion'

const LandingPage = ({ token }) => {
  const [discussions, setDiscussions] = useState(null)
  const [discussionsFetched, setDiscussionsFetched] = useState(0)
  const [discussionOrder, setDiscussionOrder] = useState('NEW')
  const [searchString, setSearchString] = useState("")
  const [timeoutId, setTimeoutId] = useState(null)

  const amountToFetch = 5

  const { data: discussionData, fetchMore } = useQuery(
    ALL_DISCUSSIONS,
    {
      fetchPolicy: "cache-and-network",
      variables: { first: amountToFetch, order: discussionOrder, filter: searchString }
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
    const { data } = await fetchMore({
      variables: {
        first: amountToFetch,
        after: discussionData.allDiscussions.length,
        order: discussionOrder,
        filter: searchString
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

  const changeOrder = (order) => {
    setDiscussionOrder(order)

    fetchMore({
      variables: {
        first: Math.max(discussionData.allDiscussions.length, amountToFetch),
        after: 0,
        order: order,
        filter: searchString
      }
    })
  }

  const onSearchChange = (filter) => {
    clearTimeout(timeoutId)

    setTimeoutId(
      setTimeout(() => {
        setSearchString(filter)
      }, 700)
    )
  }

  return (
    <div id="page" >
      <h1 className="pageTitle">Discussions</h1>
      <p className='dividerHorizontal'/>

      <div className="filterOptions">
        <div className="inputContainer">
          <i className="material-icons search">search</i>
          <input className="search"
            type="text"
            placeholder='Search...'
            onChange={({ target }) => onSearchChange(target.value)}
          />
        </div>
        <select name="order" onChange={({ target }) => changeOrder(target.value)}>
          <option value="NEW">New Discussions</option>
          <option value="OLD">Old Discussions</option>
          <option value="MEMBERS">Most Members</option>
          <option value="ALPHABETICAL">Alphabetical</option>
        </select>
      </div>

      <div id="discussions">
        {discussions?.length > 0
          ? discussions?.map(discussion =>
            <Discussion key={discussion.id} discussion={discussion} />
          )
          : <p className="nothingFound">Found nothing matching search</p>
        }
      </div>

      {discussions?.length > 0 &&
        <div className="controlAmountButtons">
          <button onClick={fetchDiscussions}>Show More</button>
          <button onClick={showLess}>Show Less</button>
        </div>
      }

      <p className="dividerHorizontal" />

      {token && <CreateDiscussionForm />}
    </div>
  )
}

export default LandingPage