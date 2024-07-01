import { redirect } from 'next/navigation'
import { ClientComponentEmail } from './client-component'
import { ksCbRequest, verifyEmail } from '@lib/api/auth'
import Analytics from '@services/analytics'
import { type Metadata } from 'next'

export function generateMetadata(): Metadata {
  return {
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function Page({ searchParams }: { searchParams: { token: string } }) {
  const { code, actionMetadata, user, emailType, email } = await verifyEmail(searchParams.token)

  if (code === 200 && actionMetadata?.action === 'KS_CB_REQUEST') {
    await ksCbRequest(user.accessToken)
  }

  if (code === 200) {
    void Analytics.track({
      eventName: 'ks_email_verify',
      properties: { email },
    })
    return (
      <ClientComponentEmail
        user={user}
        redirectTo={getRedirectTo({ emailType, error: false, path: actionMetadata?.path, success: true, email })}
      />
    )
  }

  // If verification link expired.
  if (code === 1003) {
    redirect(getRedirectTo({ email, emailType, error: false, path: actionMetadata?.path, success: false }))
  }

  redirect(getRedirectTo({ emailType, error: true, path: actionMetadata?.path, email }))
}

function getRedirectTo({
  path,
  error,
  success,
  emailType,
  email,
}: {
  path?: string
  error: boolean
  success?: boolean
  emailType: 11 | 12 | 2 | 19 | 20 | 21 | 22
  email?: string
}) {
  const urlObj = new URLSearchParams()

  if (error) {
    urlObj.set('error_in_verification', '1')
  }

  if (emailType === 11 || emailType === 21 || emailType === 22) {
    urlObj.set('magic_link_verification', success ? '1' : '0')
  }

  if (emailType === 12 || emailType === 2 || emailType === 19 || emailType === 20) {
    urlObj.set('email_verification_status', success ? '1' : '0')
    if (email) urlObj.set('email', email)
  }

  if (!success) {
    if (emailType) urlObj.set('email_type', emailType.toString())
    if (email) urlObj.set('email', email)
  }

  return (path ?? '/home') + '?' + urlObj.toString()
}
