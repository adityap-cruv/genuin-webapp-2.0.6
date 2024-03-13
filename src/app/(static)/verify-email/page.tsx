import { redirect } from 'next/navigation'
import { ClientComponent } from './client-component'
import { verifyEmail } from '@lib/api/auth'
import { headers } from 'next/headers'
import { checkAndAppendHttps } from '@lib/utils'

export default async function Page({ searchParams }: { searchParams: { token: string } }) {
  const { code, actionMetadata, user, emailType, accessToken, email } = await verifyEmail(searchParams.token)

  console.log(':: in page user::', JSON.stringify(user), JSON.stringify(actionMetadata))

  if (code === 200 && user) {
    Object.assign(user, { accessToken })
    return (
      <ClientComponent
        user={user}
        redirectTo={getRedirectTo({ emailType, error: false, path: actionMetadata?.path, success: true })}
      />
    )
  }

  // If verification link expired.
  if (code === 5176) {
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
  emailType: 11 | 12
  email?: string
}) {
  const urlObj = new URL(checkAndAppendHttps((headers().get('host') ?? process.env.HOST_NAME) + (path ?? '/home')))
  // console.log('::url object before manipulation::', urlObj.href)
  if (error) {
    urlObj.searchParams.set('error_in_verification', '1')
  }

  if (emailType === 11) {
    urlObj.searchParams.set('magic_link_verification', success ? '1' : '0')
  }

  if (emailType === 12) {
    urlObj.searchParams.set('email_verification_status', success ? '1' : '0')
  }
  if (!success) {
    if (emailType) urlObj.searchParams.set('email_type', emailType.toString())
    if (email) urlObj.searchParams.set('email', email)
  }

  // console.log('::url::', urlObj.href)

  return urlObj.href
}
