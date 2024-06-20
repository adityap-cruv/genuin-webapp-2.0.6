import { redirect } from 'next/navigation'
import { ClientComponentSMS } from './client-component'
import { verifySMS } from '@lib/api/auth'

export default async function Page({ params }: { params: { token: string } }) {
  const { code, smsType, accessToken } = await verifySMS(params.token)

  if (code === 200) {
    return <ClientComponentSMS redirectTo={getRedirectTo({ smsType, error: false, success: true, accessToken })} />
  }

  // If verification link expired.
  if (code === 1003) {
    redirect(getRedirectTo({ smsType, error: false, success: false, accessToken }))
  }

  redirect(getRedirectTo({ smsType, error: true, accessToken }))
}

function getRedirectTo({
  error,
  success,
  smsType,
  accessToken,
}: {
  error: boolean
  success?: boolean
  smsType: 8 | 9
  accessToken?: string | null
}) {
  const urlObj = new URLSearchParams()

  if (error) {
    urlObj.set('error_in_verification', '1')
  }

  if (smsType === 8 || smsType === 9) {
    urlObj.set('sms_verification_status', success ? '1' : '0')
    urlObj.set('utm_medium', 'sms')
    if (success) urlObj.set('token', String(accessToken))
  }

  if (!success) {
    if (smsType) urlObj.set('sms_type', smsType.toString())
  }

  return '/home' + '?' + urlObj.toString()
}
