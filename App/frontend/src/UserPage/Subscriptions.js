import React, { useState, useEffect } from 'react'
import { useLazyQuery } from '@apollo/client'
import { Link } from 'react-router-dom'

import { GET_DISCUSSIONS_USER_SUBSCRIBED_TO } from '../GraphQL/queries'

const Subscriptions = ({ username, amountToFetch, showLess }) => {
  const [subscriptions, setSubscriptions] = useState(null)
  const [subscriptionsFetched, setSubscriptionsFetched] = useState(0)

  const [getSubscriptions, { data: getSubscriptionsData, fetchMore }] = useLazyQuery(
    GET_DISCUSSIONS_USER_SUBSCRIBED_TO,
    {
      fetchPolicy: 'cache-and-network'
    }
  )

  useEffect(() => {
    setSubscriptionsFetched(amountToFetch)
    getSubscriptions({ variables: { username, first: amountToFetch, order: "ALPHABETICAL" } })
  }, [username]) //eslint-disable-line

  useEffect(() => {
    if (getSubscriptionsData?.findDiscussionsUserHasSubscribedTo) {
      setSubscriptions(getSubscriptionsData.findDiscussionsUserHasSubscribedTo.slice(0, subscriptionsFetched))
    }
  }, [getSubscriptionsData, subscriptionsFetched])

  const fetchSubscriptions = async (event) => {
    event.preventDefault()

    const { data } = await fetchMore({
      variables: {
        username,
        first: amountToFetch,
        after: getSubscriptionsData.findDiscussionsUserHasSubscribedTo.length
      }
    })

    if ((data?.findDiscussionsUserHasSubscribedTo.length + getSubscriptionsData.findDiscussionsUserHasSubscribedTo.length) > subscriptionsFetched) {
      setSubscriptionsFetched(subscriptionsFetched + amountToFetch)
    }
  }

  const style = {
    text: {
      padding: "0px 15px"
    },
    members: {
      top: "5px",
      right: "5px"
    }
  }

  if (subscriptions?.length > 0) {
    return (
      <div id="user_subscriptions">
        {subscriptions?.map(subscription =>
          <Link key={subscription.id} className="subscription" to={`/discussion/${subscription.name}`}>
            <h4 style={style.text}>{subscription.name}</h4>
            <div className="subscriptionSubContainer">
              <i className="material-icons member">group</i>
              {subscription.members}
            </div>
          </Link>
        )}

        {subscriptions &&
          <div className="controlAmountButtons">
            <button onClick={fetchSubscriptions}>Show More</button>
            <button onClick={() => showLess(subscriptionsFetched, setSubscriptionsFetched)}>Show Less</button>
          </div>
        }
      </div>
    )
  }

  return (
    <div id="user_subscriptions">
      <p>This user has not subscribed anywhere, yet!</p>
    </div>
  )
}

export default Subscriptions