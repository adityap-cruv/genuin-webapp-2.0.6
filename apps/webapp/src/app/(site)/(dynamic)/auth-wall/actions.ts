'use server'
import { cookies } from 'next/headers'
import { createHash } from 'crypto'

// These credentials are only visible server-side
const VALID_USERNAME = 'genuinadmin'
const VALID_PASSWORD = 'YV|)W(Ea86b78#Cr'

// Create a secure token from a value
function generateSecureToken(): string {
  // Generate random string + timestamp for uniqueness
  const randomValue = Math.random().toString(36).substring(2, 15)
  const timestamp = Date.now().toString()

  // Create a hash using a server-side secret
  const serverSecret = process.env.NEXTAUTH_SECRET || 'fallback-secret-do-not-use-in-production'
  return createHash('sha256')
    .update(randomValue + timestamp + serverSecret)
    .digest('hex')
}

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  // Simple server-side validation
  const isValid = username === VALID_USERNAME && password === VALID_PASSWORD

  // If valid credentials, set a secure HTTP-only cookie
  if (isValid) {
    // Generate a secure token
    const secureToken = generateSecureToken()

    // Set the secure cookie
    const cookieStore = await cookies()

    cookieStore.set('gn_bx_acc', secureToken, {
      httpOnly: true, // Prevents JavaScript access
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/', // Available across the site
      sameSite: 'strict', // Prevents CSRF attacks
    })

    // Set a client-readable cookie to trigger UI updates
    cookieStore.set('gn_bx_auth_state', 'authenticated', {
      httpOnly: false, // Client can read this
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
      sameSite: 'strict',
    })
  }

  return isValid
}
