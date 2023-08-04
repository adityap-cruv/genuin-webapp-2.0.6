import React, { useRef, useState, useEffect } from 'react'
import axios from 'axios'
import { Player } from '../../components/player/player'
import { Layout } from '../../components/layout/layout'
import { GetAppModal } from '../../components/basic/get_app_modal'
import { Error } from '../../components/basic/error'
import { SEO } from '../../components/basic/seo'
import { AppActions } from '../../components/basic/app_actions'
import dynamic from 'next/dynamic'

const DownloadAppPopup = dynamic(() => import('../../components/download_app_popup'))

const Video = ({
  videoDetails,
  error = false,
  geshc,
  loopId = null
}) => {
  const deepLinkParamsRef = useRef({
    pathName: null,
    hostName: null,
    geshc,
    metaDescription: null,
    metaTitle: null,
    metaPreviewImage: null
  })
  const [showModalAppDownload, setShowModalAppDownload] = useState(false)
  const getAppComponentRef = useRef(() => null)
  const handleCloseAppDownload = () => {
    getAppComponentRef.current = () => null
    setShowModalAppDownload(false)
  }
  const handleShowModalAppDownload = (message = () => null) => {
    getAppComponentRef.current = message
    setShowModalAppDownload(true)
  }

  const [showDownloadAppPopup, setShowDownloadAppPopup] = useState(false)
  const handleShowDownloadAppPopup = () => setShowDownloadAppPopup(true)

  const handleCloseDownloadAppPopup = () => setShowDownloadAppPopup(false)

  const showGetAppToViewDialog = () => {
    if (!showDownloadAppPopup) {
      handleShowModalAppDownload(() => <>Get the app to view this video.</>)
    }
  }

  const description = `Watch videos from ${videoDetails?.user_name || '@' + videoDetails?.user_nickname} on Genuin`
  const title = `${videoDetails?.description} • Watch and react on Genuin`
  let shareLink = `${process.env.hostname}v/${videoDetails?.share_string}`
  if (loopId) {
    shareLink += `?l=${loopId}`
  }
  const author = {
    '@type': 'Person',
    name: '@' + videoDetails?.user_nickname,
    url: `${process.env.hostname}p/${videoDetails?.user_nickname}`
  }
  const dateCreated = new Date(videoDetails?.created_at).toISOString()
  const dateModified = new Date(videoDetails?.updated_at).toISOString()

  const ORG_SCHEMA = JSON.stringify({
    '@context': 'http://schema.org',
    '@type': 'VideoObject',
    id: shareLink,
    url: shareLink,
    name: title,
    isPartOf: `${process.env.hostname}#website`,
    image: `${videoDetails?.video_thumbnail}/#primaryimage`,
    thumbnailUrl: videoDetails?.video_thumbnail,
    contentUrl: videoDetails?.video_url,
    embedUrl: videoDetails?.video_url,
    author,
    publisher: {
      '@type': 'Organization',
      name: 'Genuin',
      url: process.env.hostname
    },
    description,
    inLanguage: 'en-US',
    uploadDate: dateCreated,
    dateCreated,
    dateModified,
    datePublished: dateCreated,
    potentialAction: [
      {
        '@type': 'WatchAction',
        target: shareLink,
        image: videoDetails?.video_thumbnail
      }
    ]
  })

  useEffect(() => {
    deepLinkParamsRef.current.hostName = window.location.hostname
    deepLinkParamsRef.current.pathName = window.location.pathname
    deepLinkParamsRef.current.metaDescription = description
    deepLinkParamsRef.current.metaTitle = title
    deepLinkParamsRef.current.metaPreviewImage = videoDetails?.video_preview_image
  }, [])

  // todo: remove it
  const [muted, setMuted] = useState(true)
  const onClick = () => {
    setMuted(old => !old)
  }

  return error ? (
    <Error />
  ) : (
    <>
      <Layout>
        <SEO
          title={title}
          openGraphTitle={title}
          videoUrl={videoDetails?.video_url}
          videoPreviewImage={videoDetails?.video_preview_image}
          openGraphDescription={description}
          metaImageWidth={1200} // todo change this value according to needs
          metaImageHeight={630}// todo change this value according to needs
          metaVideoHeight={1000}// todo change this value according to needs
          metaVideoWidth={1000}// todo change this value according to needs
          urlToCopy={shareLink}
          author={JSON.stringify(author)}
          description={description}
          openGraphType='video'
          ownerProfileLink={`${process.env.hostname}p/${videoDetails?.user_nickname}`}
          releaseDate={dateCreated}
          updateTime={dateModified}
          videoDuration={videoDetails?.duration}
          videoType='video/mp4'
        />
        <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: ORG_SCHEMA }} />
        <Player
          videoId={videoDetails?.share_string}
          description={videoDetails?.description}
          videoUrl={videoDetails?.video_url_m3u8 ?? videoDetails?.video_url}
          videoThumbnail={videoDetails?.videothumbnail}
          userName={videoDetails?.user_nickname}
          userId={videoDetails?.user_nickname}
          userProfileImage={videoDetails?.user_profile_image}
          showGetAppModal={handleShowDownloadAppPopup}
          onEnded={showGetAppToViewDialog}
          autoplay
          onClick={onClick}
          muted={muted}
          singleVideoView={true}
          roundTableMode={!!loopId}
        >
          <AppActions
            showGetAppModal={handleShowModalAppDownload}
            userName={videoDetails?.user_nickname}
            link={videoDetails?.link}
            videoUrl={globalThis?.location?.href}
            videoDescription={videoDetails?.description}
            videoTitle='Genuin'
            deepLinkParams={deepLinkParamsRef.current}
            videoId={videoDetails?.share_string}
          />
        </Player>
        <GetAppModal
          show={showModalAppDownload}
          onClose={handleCloseAppDownload}
          TextNode={getAppComponentRef.current} />
        <DownloadAppPopup
          show={showDownloadAppPopup}
          onClose={handleCloseDownloadAppPopup}
        />
      </Layout>
    </>
  )
}

Video.getInitialProps = async ({ query: { video_id, l, geshc } }) => {
  let url, params
  if (video_id) {
    url = `${process.env.apiurl}/api/v3/public/pv`
    params = {
      video_id
    }
  }
  try {
    const res = await axios.get(url, { params })
    let videoDetails = null
    if (res?.data?.data) {
      videoDetails = res?.data?.data
    }
    if (l) {
      videoDetails = videoDetails?.chats[0]
    }
    return {
      videoDetails,
      geshc,
      loopId: l
    }
  } catch (e) {
    return {
      error: true
    }
  }
}
export default Video
