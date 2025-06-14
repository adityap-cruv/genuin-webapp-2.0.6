'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GenuinIcon } from '@icons/genuin-icon'
import { verifyCredentials } from './actions'
import bg from '@images/gradientBG.webp'

export function AuthWallComponent() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') ?? '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Use server action to verify credentials
      const isValid = await verifyCredentials(username, password)

      if (isValid) {
        // The secure cookie is now set server-side in the verifyCredentials action
        // Redirect to the original URL
        router.push(returnUrl)
      } else {
        setError('Invalid username or password')
        setIsLoading(false)
      }
    } catch (err) {
      setError('Authentication failed. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-tertiary-200 bg-cover bg-no-repeat p-4"
      style={{ backgroundImage: `url(${bg.src})` }}>
      <div className="bg-white w-full max-w-md rounded-lg bg-background p-8 shadow-lg">
        <div className="mb-6 flex justify-center">
          <GenuinIcon.logo className="h-12 w-auto fill-new-off-black" />
        </div>

        <h1 className="mb-6 text-center text-title-3-bold">Protected Content</h1>

        <p className="text-gray-600 mb-6 text-center">
          This content requires authentication. Please enter your credentials to continue.
        </p>

        {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-body-1-med">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
              }}
              disabled={isLoading}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
              }}
              disabled={isLoading}
              placeholder="Enter password"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Access Content'}
          </Button>
        </form>
      </div>
    </div>
  )
}
