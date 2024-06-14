import EmailVerificationPage from './email-verification'
import SmsVerificationPage from './sms-verification'

export default function Page({ searchParams }: { searchParams: { token: string; utm_medium?: string } }) {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { token, utm_medium } = searchParams

  if (utm_medium === 'sms') {
    return <SmsVerificationPage token={token} />
  }

  return <EmailVerificationPage token={token} />
}
