import { createContext, useContext, useEffect, useState } from 'react'
import { AuthUser } from '@/type'
import { removeBaseHeaders, setBaseHeaders } from '@/headers'
import { useQueryClient } from '@tanstack/react-query'
import { navigate } from '@/router/context'
import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'
import {
  AuthModalProvider,
  useAuthModalContext,
} from '@/components/authentication/context'
import { AuthenticationModal } from '@/components/authentication'

type AuthStatusType = 'loading' | 'authenticated' | 'unauthenticated'

type AuthContextType = {
  status: AuthStatusType
  user?: AuthUser
  signIn: (user: AuthUser) => void
  signOut: () => void
  updateUser: (user: Partial<AuthUser>) => void
}

export const AuthContext = createContext<AuthContextType>({
  status: 'loading',
  user: undefined,
  signIn: () => {},
  signOut: () => {},
  updateUser: () => {},
})

type AuthProviderPropsType = {
  children: React.ReactNode
  brandId: string
  user?: AuthUser
}

export function AuthProvider({
  children,
  user,
  brandId,
}: AuthProviderPropsType) {
  const queryClient = useQueryClient()
  const [authUser, setAuthUser] = useState<AuthUser | undefined>(
    user ?? undefined,
  )
  const pathName = usePathNameWithSubdomain()

  function signIn(user: AuthUser) {
    console.log('sign in...', user)
    setBaseHeaders({
      brandId,
      accessToken: user.accessToken,
    })

    setAuthUser(user)
    // This will invalidate all data in cache and states.
    queryClient.invalidateQueries()
  }

  function signOut() {
    navigate(pathName.home())
    console.log('sign out...')
    removeBaseHeaders()
    setAuthUser(undefined)
    // This will invalidate all data in cache and states.
    queryClient.invalidateQueries()
  }

  function updateUser(user: Partial<AuthUser>) {
    console.log('update user...', user)
    setAuthUser((prevUser) => {
      if (!prevUser) {
        return undefined
      }

      Object.assign(prevUser, user)

      return {
        ...prevUser,
      }
    })
  }

  useEffect(() => {
    if (authUser) {
      setBaseHeaders({ brandId: brandId, accessToken: authUser.accessToken })
    }
  }, [authUser])

  return (
    <AuthContext.Provider
      value={{
        status: authUser ? 'authenticated' : 'unauthenticated',
        user: authUser,
        signIn,
        signOut,
        updateUser,
      }}>
      <AuthModalProvider>
        {children}
        <AuthenticationModal.ui />
      </AuthModalProvider>
    </AuthContext.Provider>
  )
}

/**
 * This hook is used to get the current authentication status and user information.
 *
 * But it is not stateful, so it will not trigger a re-render when the status changes.
 *
 * Because we are figuring out the status and user information at initialization.
 * @returns {AuthContextType}
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('Please use this component inside auth provider.')
  }
  return context
}
