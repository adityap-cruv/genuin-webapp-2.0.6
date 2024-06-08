'use client'
export function RedirectToHTTPS() {
  function redirect() {
    window.location.href = window.location.href.replace(/^http:/, 'https:')
  }

  if (process.env.NEXT_PUBLIC_CURRENT_ENV === 'prod' && window !== undefined && window.location.protocol === 'http:') {
    redirect()
  }

  return <></>
}
