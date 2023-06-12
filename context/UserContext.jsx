import {
  useSessionContext,
  useUser as useSupaUser
} from '@supabase/auth-helpers-react'
import { createContext, useEffect, useState } from 'react'

export const UserContext = createContext(undefined)

export const MyUserContextProvider = (props) => {
  const {
    session,
    isLoading: isLoadingUser,
    supabaseClient: supabase
  } = useSessionContext()

  const user = useSupaUser()

  const accessToken = session?.access_token ?? null

  const [isLoadingData, setIsLoadingData] = useState(false)
  const [userDetails, setUserDetails] = useState(null)
  const [subscription, setSubscription] = useState(null)

  const getUserDetails = () => supabase.from('users').select('*').single()

  const getSubscription = () =>
    supabase
      .from('subscriptions')
      .select('*, prices(*, products(*))')
      .in('status', ['trialing', 'active'])
      .single()

  useEffect(() => {
    if (user && !isLoadingData && !userDetails && !subscription) {
      setIsLoadingData(true)

      Promise.allSettled([getUserDetails(), getSubscription()]).then(
        ([userDetails, subscription]) => {
          if (userDetails.status === 'fulfilled') {
            setUserDetails(userDetails.value.data)
          }

          if (subscription.status === 'fulfilled') {
            setSubscription(subscription.value.data)
          }

          setIsLoadingData(false)
        }
      )
    } else if (!user && !isLoadingUser && !isLoadingData) {
      setUserDetails(null)
      setSubscription(null)
    }
  }, [user, isLoadingUser])

  const value = {
    accessToken,
    user,
    userDetails,
    isLoading: isLoadingUser || isLoadingData,
    subscription
  }

  return (
    <UserContext.Provider
      value={value}
      {...props}
    />
  )
}
