import { redirect } from 'next/navigation'
import { resetPassword } from '@lib/api/auth-passwords'
import { PATH_NAME } from '@lib/utils/constants/path'
import { type Metadata } from 'next'

export default async function Page({ searchParams }: { searchParams: { token: string } }) {
  const { code, emailType, forgotPasswordToken } = await resetPassword(searchParams.token)
  if (code === 200) {
    return redirect(getRedirectTo({ emailType, error: false, success: true, forgotPasswordToken }))
  }

  // If verification link expired.
  if (code === 1003) {
    redirect(getRedirectTo({ emailType, error: false, success: false }))
  }

  redirect(getRedirectTo({ emailType, error: true }))
}

export function generateMetadata(): Metadata {
  return {
    robots: {
      index: false,
      follow: false,
    },
  }
}

function getRedirectTo({
  error,
  success,
  emailType,
  forgotPasswordToken,
}: {
  error: boolean
  success?: boolean
  emailType: 11 | 12 | 2 | 16
  forgotPasswordToken?: string | undefined
}) {
  // const urlObj = new URL(checkAndAppendHttps((headers().get('host') ?? process.env.HOST_NAME) + (path ?? '/home')))
  // const urlObj = new URL(('http://' + headers().get('host') ?? process.env.HOST_NAME) + (path ?? '/home'))
  const urlObj = new URLSearchParams()

  if (error) {
    urlObj.set('error_in_verification', '1')
  }

  if (emailType === 16) {
    urlObj.set('reset_password_status', success ? '1' : '0')
    if (success) urlObj.set('token', String(forgotPasswordToken))
  }

  if (!success) {
    if (emailType) urlObj.set('email_type', emailType.toString())
  }

  return PATH_NAME.home() + '?' + urlObj.toString()
}
