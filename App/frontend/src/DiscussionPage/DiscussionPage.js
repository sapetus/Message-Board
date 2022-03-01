import React, { useEffect, useState } from 'react'
import { useLazyQuery, useMutation } from '@apollo/client'
import { useParams } from 'react-router-dom'

import { FIND_DISCUSSION } from '../GraphQL/queries'
import {
  SUBSCRIBE_TO_DISCUSSION,
  UNSUBSCRIBE_FROM_DISCUSSION
} from '../GraphQL/mutations'

import Posts from './Posts'
import CreatePostForm from './CreatePostForm'

const DiscussionPage = ({ token }) => {
  const [discussionName, setDiscussionName] = useState(null)
  const [discussionDescription, setDiscussionDescription] = useState(null)
  const [discussionMembers, setDiscussionMembers] = useState(null)
  const [listOfMembers, setListOfMembers] = useState(null)
  const [userIsSubscribed, setUserIsSubscribed] = useState(false)
  const [showPostForm, setShowPostForm] = useState(false)

  let params = useParams()

  const [getDiscussion, { data: getDiscussionData }] = useLazyQuery(
    FIND_DISCUSSION,
    { fetchPolicy: 'cache-and-network' }
  )

  const [subscribeToDiscussion] = useMutation(
    SUBSCRIBE_TO_DISCUSSION,
    {
      onError: (error) => {
        console.log(error.graphQLErrors[0].message)
      },
      refetchQueries: [{ query: FIND_DISCUSSION, variables: { name: params.name } }]
    }
  )

  const [unsubscribeFromDiscussion] = useMutation(
    UNSUBSCRIBE_FROM_DISCUSSION,
    {
      onError: (error) => {
        console.log(error.graphQLErrors[0].message)
      },
      refetchQueries: [{ query: FIND_DISCUSSION, variables: { name: params.name } }]
    }
  )

  useEffect(() => {
    const element = document.getElementById('showPostForm')
    switch (showPostForm) {
      case false:
        if (element) element.style.backgroundColor = "transparent"
        break
      case true:
        if (element) element.style.backgroundColor = "#8C54F3"
        break
      default:
        break
    }
  }, [showPostForm])

  useEffect(() => {
    getDiscussion({ variables: { name: params.name } })
  }, [params.name]) //eslint-disable-line

  useEffect(() => {
    if (getDiscussionData?.findDiscussion) {
      const data = getDiscussionData.findDiscussion
      setDiscussionDescription(data.description)
      setDiscussionName(data.name)
      setDiscussionMembers(data.members)
      setListOfMembers(data.listOfMembers)
    }
  }, [getDiscussionData?.findDiscussion])

  //check if user is subscribed and show subscribe buttons accordingly
  //but only when user is logged in
  useEffect(() => {
    if (listOfMembers && token) {
      const memberNames = listOfMembers.map(user => user.username)
      setUserIsSubscribed(memberNames.includes(localStorage.getItem('username')))
    }
  }, [listOfMembers, token])

  const subscribe = (discussionName) => {
    subscribeToDiscussion({ variables: { discussionName } })
  }

  const unsubscribe = (discussionName) => {
    unsubscribeFromDiscussion({ variables: { discussionName } })
  }

  const style = {
    left: {
      paddingLeft: "50px"
    },
    right: {
      paddingRight: "50px"
    }
  }

  return (
    <div id="page">
      <div id="discussionInfo">
        <div className="columnContainer" style={style.left}>
          <h1>{discussionName}</h1>
          <div className="rowContainer">
            <div>
              <i className="material-icons member">group</i>
              {discussionMembers}
            </div>
            {token && // only show when user is logged in
              <div id="subscriptionSelection">
                {userIsSubscribed
                  ? //if is subscribed, show unsubscribe
                  <button className='activeButton' onClick={() => unsubscribe(discussionName)}>
                    Unsubscribe
                  </button>
                  : //if isn't subscribed, show subscribe
                  <button className="inactiveButton" onClick={() => subscribe(discussionName)}>
                    Subscribe
                  </button>
                }
              </div>
            }
          </div>
        </div>
        {discussionDescription
          ? <p style={style.right}>{discussionDescription}</p>
          : <p>This discussion has no description</p>
        }
      </div>

      {token &&
        <button id="showPostForm" onClick={() => setShowPostForm(!showPostForm)}>
          Create Post
        </button>}

      {showPostForm &&
        <CreatePostForm
          discussionName={params.name}
        />}
      <p className="dividerHorizontal" />

      <Posts name={params.name} />
    </div>
  )
}

export default DiscussionPage