import { redirect } from 'next/navigation'
import { ClientComponent } from './client-component'
import { verifyEmail } from '@lib/api/auth'

export default async function Page({ searchParams }: { searchParams: { token: string } }) {
  const { code, actionMetadata, user, emailType, email } = await verifyEmail(searchParams.token)
  if (code === 200) {
    return (
      <ClientComponent
        user={user}
        redirectTo={getRedirectTo({ emailType, error: false, path: actionMetadata?.path, success: true })}
      />
    )
  }

  // If verification link expired.
  if (code === 1003) {
    redirect(getRedirectTo({ email, emailType, error: false, path: actionMetadata?.path, success: false }))
  }

  redirect(getRedirectTo({ emailType, error: true, path: actionMetadata?.path }))
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
  emailType: 11 | 12 | 2 | 16
  email?: string
}) {
  // const urlObj = new URL(checkAndAppendHttps((headers().get('host') ?? process.env.HOST_NAME) + (path ?? '/home')))
  // const urlObj = new URL(('http://' + headers().get('host') ?? process.env.HOST_NAME) + (path ?? '/home'))
  const urlObj = new URLSearchParams()

  if (error) {
    urlObj.set('error_in_verification', '1')
  }

  if (emailType === 11) {
    urlObj.set('magic_link_verification', success ? '1' : '0')
  }

  if (emailType === 12 || emailType === 2) {
    urlObj.set('email_verification_status', success ? '1' : '0')
  }

  if (!success) {
    if (emailType) urlObj.set('email_type', emailType.toString())
    if (email) urlObj.set('email', email)
  }

  return (path ?? '/home') + '?' + urlObj.toString()
}
