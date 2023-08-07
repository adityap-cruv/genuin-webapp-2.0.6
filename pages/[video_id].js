import React, { useEffect } from 'react'
import NextHead from 'next/head'

const Component = ({
  videoId,
  geshc,
  loopId
}) => {
  useEffect(() => {
    let link = ''
    if (videoId) {
      link += `/v/${videoId}`
    }
    if (loopId) {
      link += `?l=${loopId}`
    }
    if (geshc) {
      link += `&geshc=${geshc}`
    }
    window.history.replaceState(null, '', link)
    window.location.reload()
  }, [])
  return <>
    <NextHead>
      <meta name="robots" content="noindex, nofollow"></meta>
    </NextHead>
  </>
}

Component.getInitialProps = async ({ query: { video_id, l, geshc } }) => {
  const objToReturn = {}
  if (video_id) {
    Object.assign(objToReturn, { videoId: video_id })
  }
  if (l) {
    Object.assign(objToReturn, { loopId: l })
  }
  if (geshc) {
    Object.assign(objToReturn, { geshc })
  }

  return objToReturn
}

export default Component
