import React, { useEffect } from 'react'
import { Error } from '../../components/basic/error'
import NextHead from 'next/head'
import { GenuinLoader } from '../../components/basic/genuin_loader'

const Component = ({ shareString, videoId, geshc = null }) => {
  useEffect(() => {
    let link = ''
    if (shareString) {
      link = `/l/${shareString}?geshc=${geshc}`
      if (videoId) link = `/v/${videoId}?l=${shareString}&geshc=${geshc}`
    }

    window.history.replaceState(null, '', link)
    window.location.reload()
  }, [])
  return <>
    <NextHead>
      <meta name="robots" content="noindex, nofollow"></meta>
    </NextHead>
    {!shareString && <Error />}
    <GenuinLoader/>
  </>
}

Component.getInitialProps = async ({ query: { share_string, v, geshc } }) => {
  return {
    shareString: share_string,
    videoId: v,
    geshc
  }
}

export default Component
