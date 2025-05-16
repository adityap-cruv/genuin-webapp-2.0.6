/**
 * Server Component example for testing Next.js 15 Server Components optimization
 *
 * This component demonstrates:
 * 1. Server-side data fetching
 * 2. Proper implementation of React Server Components pattern
 * 3. Integration with Client Components where needed
 */

import { Suspense } from 'react'

// This is a Server Component that fetches data
async function UserProfileData({ userId }: { userId: string }) {
  // Server-side data fetching
  const userData = await fetchUserData(userId)

  return (
    <div className="profile-data">
      <h2>{userData.name}</h2>
      <p className="email">{userData.email}</p>
      <div className="stats">
        <span>Posts: {userData.stats.posts}</span>
        <span>Followers: {userData.stats.followers}</span>
        <span>Following: {userData.stats.following}</span>
      </div>
    </div>
  )
}

// Mock data fetching function
async function fetchUserData(userId: string) {
  // In a real app, this would be a database or API call
  // For testing, we'll just simulate a network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    id: userId,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    stats: {
      posts: 42,
      followers: 1024,
      following: 256,
    },
  }
}

// This is a Client Component for interactive elements
;('use client')

import { useState } from 'react'

function UserActions({ userId }: { userId: string }) {
  const [isFollowing, setIsFollowing] = useState(false)

  return (
    <div className="user-actions">
      <button
        className={`follow-button ${isFollowing ? 'following' : ''}`}
        onClick={() => setIsFollowing(!isFollowing)}>
        {isFollowing ? 'Following' : 'Follow'}
      </button>
      <button className="message-button">Message</button>
    </div>
  )
}

// Root component that combines Server and Client components
export default function UserProfile({ params }: { params: { userId: string } }) {
  const userId = params.userId || '123'

  return (
    <div className="user-profile-container">
      <Suspense fallback={<div>Loading profile data...</div>}>
        <UserProfileData userId={userId} />
      </Suspense>
      <UserActions userId={userId} />
    </div>
  )
}
