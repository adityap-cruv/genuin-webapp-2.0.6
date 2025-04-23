import { useLocation } from 'wouter'
import { useEffect } from 'react'
import { navigate } from './context'
import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'
import { isValidRoute } from './index'

/**
 * Middleware component that validates routes and redirects to not-found if invalid
 */
export function RouteMiddleware({ children }: { children: React.ReactNode }) {
  const pathName = usePathNameWithSubdomain()
  const [location] = useLocation()

  useEffect(() => {
    // If route is not valid, redirect to not-found
    if (!isValidRoute(location)) {
      navigate(pathName.notFound())
    }
  }, [location])

  return <>{children}</>
}
