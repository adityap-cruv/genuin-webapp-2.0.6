import { redirect } from 'next/navigation'
import { ClientComponent } from './client-component'
import { verifyEmail } from '@lib/api/auth'
import { headers } from 'next/headers'

export default async function Page({ searchParams }: { searchParams: { token: string } }) {
  const { code, actionMetadata, user, emailType } = await verifyEmail(searchParams.token)

  if (code === 200 && user) {
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
  const urlObj = new URL((headers().get('host') ?? process.env.HOST_NAME) + (path ?? '/home'))

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
