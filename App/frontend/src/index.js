import React from 'react';
import ReactDOM from 'react-dom';
import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  ApolloConsumer
} from '@apollo/client'
import { setContext } from 'apollo-link-context'
import { BrowserRouter } from 'react-router-dom';

import App from './App';

const authenticationLink = setContext((__, { headers }) => {
  const token = localStorage.getItem('message_board_user_token')
  return {
    headers: {
      ...headers,
      authorization: token ? `bearer ${token}` : null
    }
  }
})

const httpLink = new HttpLink({ uri: 'http://localhost:4000/graphql' })

const mergeFunction = (existing, incoming, after) => {
  const merged = existing ? existing.slice(0) : []

  for (let i = 0; i < incoming.length; i++) {
    merged[after + i] = incoming[i]
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
            merge(existing, incoming, { args: { after = 0 } }) {
              return mergeFunction(existing, incoming, after)
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
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById('root')
);