'use client'
import { signIn } from 'next-auth/react'

const Page = () => {
  return (
    <div className="items-center flex justify-center h-full w-full flex-col">
      <button
        onClick={() => {
          signIn('credentials', { action: 'sent-otp', callbackUrl: '/' })
        }}>
        Sign In
      </button>
    </div>
  )
}

export default Page
