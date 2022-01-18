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
import { offsetLimitPagination } from '@apollo/client/utilities';

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

  return merged
}

const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          findDiscussionsUserHasSubscribedTo: {
            keyArgs: [],
            merge(existing, incoming, { args: { after = 0 } }) {
              return mergeFunction(existing, incoming, after)
            }
          },
          findPostsByUser: {
            keyArgs: [],
            merge(existing, incoming, { args: { after = 0 } }) {
              return mergeFunction(existing, incoming, after)
            }
          },
          findCommentsByUser: {
            keyArgs: [],
            merge(existing, incoming, { args: { after = 0 } }) {
              return mergeFunction(existing, incoming, after)
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