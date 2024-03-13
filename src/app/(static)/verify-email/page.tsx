import { redirect } from 'next/navigation'
import { ClientComponent } from './client-component'
import { verifyEmail } from '@lib/api/auth'
import { headers } from 'next/headers'
import { checkAndAppendHttps } from '@lib/utils'

export default async function Page({ searchParams }: { searchParams: { token: string } }) {
  const { code, actionMetadata, user, emailType, accessToken } = await verifyEmail(searchParams.token)

  console.log(':: in response page code::', code)
  console.log(':: in page user::', user)

  if (code === 200 && user) {
    Object.assign(user, { accessToken })
    return (
      <ClientComponent
        user={user}
        redirectTo={getRedirectTo({ emailType, error: false, path: actionMetadata?.path, success: true })}
      />
    )
  }

  if (code === 5176) {
    redirect(getRedirectTo({ emailType, error: false, path: actionMetadata?.path, success: false }))
  }

  redirect(getRedirectTo({ emailType, error: true, path: actionMetadata?.path }))
}

function getRedirectTo({
  path,
  error,
  success,
  emailType,
}: {
  path?: string
  error: boolean
  success?: boolean
  emailType: 11 | 12
}) {
  const urlObj = new URL(checkAndAppendHttps((headers().get('host') ?? process.env.HOST_NAME) + (path ?? '/home')))
  console.log('::url object before manipulation::', urlObj.href)
  if (error) {
    urlObj.searchParams.set('error_in_verification', '1')
  }

  if (emailType === 11) {
    urlObj.searchParams.set('magic_link_verification', success ? '1' : '0')
  }

  if (emailType === 12) {
    urlObj.searchParams.set('email_verification_status', success ? '1' : '0')
  }

  console.log('::url::', urlObj.href)

  return urlObj.href
}
