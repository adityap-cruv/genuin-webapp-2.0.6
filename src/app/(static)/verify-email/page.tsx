import { redirect } from 'next/navigation'
import { ClientComponent } from './client-component'
import { verifyEmail } from '@lib/api/auth'

export default async function Page({ searchParams }: { searchParams: { token: string } }) {
  const { code, actionMetadata, user, emailType } = await verifyEmail(searchParams.token)

  if (code === 200) {
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

  if (code === 1003 || code === 5033 || code === 5100 || code === 5052 || code === 1099) {
    redirect(getRedirectTo({ emailType, error: true, path: actionMetadata?.path }))
  }
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
  path ??= '/home'
  if (error) {
    path += '?error_in_verification=1'
  }

  if (emailType === 11) {
    path += '?magic_link_verification='
    success ? (path += '1') : (path += '0')
  }

  if (emailType === 12) {
    path += '?email_verification_status='
    success ? (path += '1') : (path += '0')
  }
  console.log('::path::', path)
  return path
}
