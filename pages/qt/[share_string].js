import React, { useEffect } from 'react'
import { Error } from '../../components/basic/error'
import NextHead from 'next/head'
import { GenuinLoader } from '../../components/basic/genuin_loader'

const Component = ({
  shareString,
  error = false
}) => {
  useEffect(() => {
    if (shareString) {
      window.history.replaceState(null, '', `/q/${shareString}`)
      window.location.reload()
    }
  }, [])
  return <>
    <NextHead>
      <meta name="robots" content="noindex, nofollow"></meta>
    </NextHead>
    {error
      ? <Error />
      : <GenuinLoader />}
  </>
}

Component.getInitialProps = async ({ query: { share_string } }) => {
  if (share_string) {
    return { shareString: share_string }
  }
  return { error: true }
}

export default Component
