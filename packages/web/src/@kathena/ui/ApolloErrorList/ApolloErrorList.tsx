/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, ReactNode } from 'react'

import { ApolloError as ApolloErrorType } from '@apollo/client'
import { Alert, Grid, GridProps } from '@material-ui/core'
import get from 'lodash/get'

import withComponentHocs from '../hocs/withComponentHocs'

export type ApolloErrorListProps = {
  error: ApolloErrorType | null
  className?: string
  spacing?: GridProps['spacing']
}

export const getErrorMessage = (error: any): any => {
  const getMsg = () => {
    let errCode = ''
    let msg = ''
    if (typeof get(error, 'extensions.code') === 'string') {
      errCode = get(error, 'extensions.code')
    }

    if (typeof get(error, 'message') === 'string') {
      msg = get(error, 'message')
    }

    if (msg && errCode) {
      return (
        <>
          <strong>{errCode}</strong>
          <br />
          {msg}
        </>
      )
    }

    if (msg) {
      return msg
    }

    if (errCode) {
      return errCode
    }

    return get(error, 'networkError.bodyText', 'got_error_try_again')
  }

  const msg = getMsg() // .replace(/^GraphQL error: /, '')

  return msg
}

export const renderApolloError = (error: ApolloErrorType | null) => (
  renderer: (value: any, idx: number) => ReactNode = (msg, idx) => (
    <div key={idx}>{msg}</div>
  ),
): ReactNode[] => {
  const errorMessages = error?.graphQLErrors.length
    ? error.graphQLErrors.map((graphQLError) => getErrorMessage(graphQLError))
    : ['Oops. Something went wrong.']

  return errorMessages.map(renderer)
}

const ApolloErrorList: FC<ApolloErrorListProps> = (props) => {
  const { error, spacing = 1 } = props

  return (
    <Grid container spacing={spacing} direction="column" wrap="nowrap">
      {renderApolloError(error)((msg, idx) => (
        <Grid item key={idx}>
          <Alert severity="error">{msg}</Alert>
        </Grid>
      ))}
    </Grid>
  )
}

export default withComponentHocs(ApolloErrorList)
