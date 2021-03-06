import React from 'react';
import ReactDOM from 'react-dom';
import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache
} from '@apollo/client'
import { setContext } from 'apollo-link-context'
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import ScrollToTop from './Components/ScrollToTop';

const authenticationLink = setContext((__, { headers }) => {
  const token = localStorage.getItem('message_board_user_token')
  return {
    headers: {
      ...headers,
      authorization: token ? `bearer ${token}` : null
    }
  }
})

const httpLink = new HttpLink({ uri: '/graphql' })

const mergeFunction = (existing, incoming, after, filter) => {
  let merged = existing ? existing.slice(0) : []

  //with this, only the filtered items are shown
  if (filter !== '' && after === 0) {
    merged = incoming
  } else {
    for (let i = 0; i < incoming.length; i++) {
      merged[after + i] = incoming[i]
    }
  }

  //this gets rid of duplicates that appear when a new comment/post is created
  const uniqueOnly = [...new Map(merged.map(obj => [obj.__ref, obj])).values()]

  return uniqueOnly
}

const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          allDiscussions: {
            keyArgs: [],
            merge(existing, incoming, { args: { after = 0, filter = '' } }) {
              return mergeFunction(existing, incoming, after, filter)
            }
          },
          findPostsByDiscussion: {
            keyArgs: ["name"],
            merge(existing, incoming, { args: { after = 0 } }) {
              return mergeFunction(existing, incoming, after)
            }
          },
          findDiscussionsUserHasSubscribedTo: {
            keyArgs: ["username"],
            merge(existing, incoming, { args: { after = 0 } }) {
              return mergeFunction(existing, incoming, after)
            }
          },
          findPostsByUser: {
            keyArgs: ["username"],
            merge(existing, incoming, { args: { after = 0 } }) {
              return mergeFunction(existing, incoming, after)
            }
          },
          findCommentsByUser: {
            keyArgs: ["username"],
            merge(existing, incoming, { args: { after = 0 } }) {
              return mergeFunction(existing, incoming, after)
            }
          },
          findCommentsByPost: {
            keyArgs: ["id"],
            merge(existing, incoming, { args: { after = 0 } }) {
              return mergeFunction(existing, incoming, after)
            }
          },
          userMessages: {
            keyArgs: ["username"],
            merge(existing, incoming, { args: { after = 0 } }) {
              return mergeFunction(existing, incoming, after)
            }
          }
        }
      },
      Comment: {
        fields: {
          listOfLikeUsers: {
            merge(existing, incoming) {
              return incoming
            }
          },
          listOfDislikeUsers: {
            merge(existing, incoming) {
              return incoming
            }
          }
        }
      }
    }
  }),
  link: authenticationLink.concat(httpLink)
})

ReactDOM.render(
  <BrowserRouter >
    <ScrollToTop>
      <ApolloProvider client={client} >
        <App />
      </ApolloProvider>
    </ScrollToTop>
  </BrowserRouter>,
  document.getElementById('root')
);