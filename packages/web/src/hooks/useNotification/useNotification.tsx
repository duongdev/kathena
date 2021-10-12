import { useEffect } from 'react'

import { useSnackbar } from 'notistack'

import { useAuth } from 'common/auth'
import { useNotificationSubscription } from 'graphql/generated'

/* eslint-disable react/jsx-props-no-spreading */
const useNotification = () => {
  const { $account: accountAuth } = useAuth()
  const { enqueueSnackbar } = useSnackbar()

  const { data } = useNotificationSubscription({
    variables: {
      targetId: accountAuth.id,
    },
  })
  useEffect(() => {
    if (data?.notification.title) {
      enqueueSnackbar(data?.notification.title, { variant: 'default' })
    }
  }, [data?.notification.title, enqueueSnackbar])
}

export default useNotification
