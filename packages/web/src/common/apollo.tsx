import { FC } from 'react'

import {
  ApolloClient,
  ApolloProvider as Provider,
  from,
  Operation,
  split,
} from '@apollo/client'
import { BatchHttpLink } from '@apollo/client/link/batch-http'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { WebSocketLink } from '@apollo/client/link/ws'
import { getMainDefinition } from '@apollo/client/utilities'
import { createUploadLink } from 'apollo-upload-client'

import { ANY } from '@kathena/types'
import { LOCAL_STORAGE_JWT } from 'common/constants'

import { buildPath, SIGN_IN } from '../utils/path-builder'

import cache from './cache'

const SKIP_AUTH_OPS = ['SignIn']
const TOKEN_EXPIRED = 'TOKEN_EXPIRED'

const uri = process.env.REACT_APP_GRAPHQL_URI || `/graphql`

const httpLink = new BatchHttpLink({ uri })

const wsLink = new WebSocketLink({
  uri:
    process.env.REACT_APP_WEB_SOCKET_URI ||
    `wss://${window.location.host}/graphql`,
  options: {
    reconnect: true,
  },
})

const uploadLink = createUploadLink({
  uri,
  credentials: 'same-origin',
})

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

const isFile = (value: ANY) => {
  if (Array.isArray(value)) {
    return value.some(isFile)
  }

  const isFileCheck =
    (typeof File !== 'undefined' && value instanceof File) ||
    (typeof Blob !== 'undefined' && value instanceof Blob)

  return isFileCheck
}

const isUpload = ({ variables, getContext }: Operation) => {
  if (getContext().hasFileUpload) {
    return true
  }
  return Object.values(variables).some(isFile)
}

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  httpLink,
)

const client = new ApolloClient({
  // link: authLink.concat(errorLink).concat(httpLink),
  link: from([authLink, errorLink, split(isUpload, uploadLink as ANY, link)]),
  cache,
  // defaultOptions: { watchQuery: { fetchPolicy: 'cache-and-network' } },
})

export const ApolloProvider: FC = ({ children }) => (
  <Provider client={client}>{children}</Provider>
)
