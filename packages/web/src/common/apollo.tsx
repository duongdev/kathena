import { FC } from 'react'

import {
  ApolloClient,
  ApolloProvider as Provider,
  createHttpLink,
  InMemoryCache,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'

import { LOCAL_STORAGE_JWT } from 'common/constants'

import { buildPath, SIGN_IN } from '../utils/path-builder'

const SKIP_AUTH_OPS = ['SignIn']
const TOKEN_EXPIRED = 'TOKEN_EXPIRED'

const uri = process.env.REACT_APP_GRAPHQL_URI || `/graphql`

const httpLink = createHttpLink({ uri })

const authLink = setContext(({ operationName }, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem(LOCAL_STORAGE_JWT)?.replace(/"/g, '')
  // return the headers to the context so httpLink can read them

  if (!token || (operationName && SKIP_AUTH_OPS.includes(operationName))) {
    return headers
  }

  return {
    headers: {
      ...headers,
      authorization: `Bearer ${token}`,
    },
  }
})

const errorLink = onError(({ graphQLErrors }) => {
  const isTokenExpired = !!graphQLErrors?.some(
    ({ message }) => message === TOKEN_EXPIRED,
  )

  if (isTokenExpired && window.location) {
    const { location } = window

    location.href = `${location.origin}${buildPath(
      SIGN_IN,
      {},
      { isTokenExpired, redirect: location.href },
    )}`
  }
})

const client = new ApolloClient({
  link: authLink.concat(errorLink).concat(httpLink),
  cache: new InMemoryCache(),
  // defaultOptions: { watchQuery: { fetchPolicy: 'cache-and-network' } },
})

export const ApolloProvider: FC = ({ children }) => (
  <Provider client={client}>{children}</Provider>
)
