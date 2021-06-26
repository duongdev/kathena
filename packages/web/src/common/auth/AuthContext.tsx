import { useCallback, useMemo } from 'react'

import qs from 'query-string'
import { useLocalStorage } from 'react-use'
import { createContainer } from 'unstated-next'

import { wait } from '@kathena/utils'
import { DEFAULT_ORG_NS, LOCAL_STORAGE_JWT } from 'common/constants'
import {
  AuthenticateQuery,
  useAuthenticateQuery,
  useSignInMutation,
  useCallOtpMutation,
  useSetPasswordMutation,
} from 'graphql/generated'
import { buildPath, ORG_WORKSPACE } from 'utils/path-builder'

export type AuthAccount = AuthenticateQuery['authenticate']['account']

const useAuthHook = () => {
  const [mutateSignIn] = useSignInMutation()
  const [mutateCallOTP] = useCallOtpMutation()
  const [mutateSetPassword] = useSetPasswordMutation()
  const [jwt, setJwt, removeJwt] = useLocalStorage<string>(LOCAL_STORAGE_JWT)
  const { data: authenticateData, loading } = useAuthenticateQuery({
    skip: !jwt,
  })

  const authData = useMemo(
    () => authenticateData?.authenticate ?? null,
    [authenticateData?.authenticate],
  )

  const signIn = useCallback(
    async ({
      identity,
      password,
      orgNamespace = DEFAULT_ORG_NS,
    }: {
      identity: string
      password: string
      orgNamespace?: string
    }) => {
      const { data } = await mutateSignIn({
        variables: { identity, password, orgNamespace },
      })

      if (!data) return

      const { token, org } = data.signIn

      setJwt(token)

      await wait(500)

      const redirect =
        qs.parse(window.location.search).redirect ??
        buildPath(ORG_WORKSPACE, { orgNamespace: org.namespace })

      window.location.href = redirect as string
    },
    [mutateSignIn, setJwt],
  )

  const signOut = useCallback(async () => {
    removeJwt()

    window.location.reload()
  }, [removeJwt])

  const callOTP = useCallback(
    async ({
      identity,
      type,
    }: {
      identity: string
      type: 'ACTIVE_ACCOUNT' | 'RESET_PASSWORD'
    }): Promise<AuthAccount | null> => {
      const { data } = await mutateCallOTP({
        variables: { identity, type },
      })
      if (!data) return null
      return data.callOTP
    },
    [mutateCallOTP],
  )

  const setPassword = useCallback(
    async ({
      usernameOrEmail,
      password,
      otp,
    }: {
      usernameOrEmail: string
      password: string
      otp: string
    }): Promise<AuthAccount | null> => {
      const { data } = await mutateSetPassword({
        variables: { usernameOrEmail, password, otp },
      })
      if (!data) return null
      return data.setPassword
    },
    [mutateSetPassword],
  )

  return {
    account: authData?.account ?? null,
    org: authData?.org ?? null,
    permissions: authData?.permissions ?? [],
    signIn,
    signOut,
    callOTP,
    setPassword,
    loading,
    /* eslint-disable @typescript-eslint/no-non-null-assertion  */
    /* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
    $account: authData?.account!,
    $org: authData?.org!,
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
    /* eslint-enable @typescript-eslint/no-non-null-asserted-optional-chain */
  }
}

const AuthContainer = createContainer(useAuthHook)

export const AuthProvider = AuthContainer.Provider
export const useAuth = AuthContainer.useContainer
