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
import Modal from '../Components/Modal'

const DiscussionPage = ({ token }) => {
  const [discussionName, setDiscussionName] = useState(null)
  const [discussionDescription, setDiscussionDescription] = useState(null)
  const [discussionMembers, setDiscussionMembers] = useState(null)
  const [listOfMembers, setListOfMembers] = useState(null)
  const [userIsSubscribed, setUserIsSubscribed] = useState(false)
  const [showPostForm, setShowPostForm] = useState(false)
  const [message, setMessage] = useState(null)

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
        if (element) {
          element.style.backgroundColor = "#1F1F1F"
          element.textContent = "Create Post"
        }
        break
      case true:
        if (element) {
          element.style.backgroundColor = "#8C54F3"
          element.textContent = "Hide"
        }
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

  return (
    <div id="page">
      {message && <Modal text={message} setMessage={setMessage} />}

      <div id="discussionInfo">
        <div className="columnContainer" >
          <h1 className='wrap'>{discussionName}</h1>
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
          <h4 style={{ position: "relative", left: "20px" }}>
            <i className="material-icons member">group</i>
            {discussionMembers}
          </h4>
        </div>
        {discussionDescription
          ? <p id="description">{discussionDescription}</p>
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
          setMessage={setMessage}
        />}
      {token && <p className="dividerHorizontal" />}

      <Posts name={params.name} />
    </div>
  )
}

export default DiscussionPage