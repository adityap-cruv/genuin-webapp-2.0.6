import { redirect } from 'next/navigation'
import { RedirectClientPage } from './client-page'

export default async function WebCatchAllPage(props: any) {
  // Await props.params if it's a Promise (Next.js 15 can pass async params)
  const params = typeof props.params?.then === 'function' ? await props.params : props.params
  const isRedirect = Array.isArray(params.params) && params.params.length === 1 && params.params[0] === 'redirect'
  if (!isRedirect) {
    return redirect('https://www.ted.com?utm_source=shorts')
  }
  return <RedirectClientPage />
}
