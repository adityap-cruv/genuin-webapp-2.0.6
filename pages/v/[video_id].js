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
  console.log('details::', videoDetails)
  const description = `Watch videos from ${videoDetails?.owner?.username || '@' + videoDetails?.video?.nickname} on Genuin`
  const title = `${videoDetails?.video?.description ? videoDetails?.video?.description + ' • ' : ''}Watch and react on Genuin`
  let shareLink = `${process.env.hostname}v/${videoDetails?.video?.share_string}`
  if (loopId) {
    shareLink += `?l=${loopId}`
  }
  const author = {
    '@type': 'Person',
    name: '@' + videoDetails?.owner?.nickname,
    url: `${process.env.hostname}p/${videoDetails?.owner?.nickname}`
  }
  // const dateCreated = new Date(videoDetails?.video?.created_at).toISOString()
  // const dateModified = new Date(videoDetails?.video?.updated_at).toISOString()

  const ORG_SCHEMA = JSON.stringify({
    '@context': 'http://schema.org',
    '@type': 'VideoObject',
    id: shareLink,
    url: shareLink,
    name: title,
    isPartOf: `${process.env.hostname}#website`,
    image: `${videoDetails?.video?.thumbnail}/#primaryimage`,
    thumbnailUrl: videoDetails?.video?.thumbnail,
    contentUrl: videoDetails?.video?.url,
    embedUrl: videoDetails?.video?.url,
    author,
    publisher: {
      '@type': 'Organization',
      name: 'Genuin',
      url: process.env.hostname
    },
    description,
    inLanguage: 'en-US',
    // uploadDate: dateCreated,
    // dateCreated,
    // dateModified,
    // datePublished: dateCreated,
    potentialAction: [
      {
        '@type': 'WatchAction',
        target: shareLink,
        image: videoDetails?.video?.thumbnail
      }
    ]
  })

  useEffect(() => {
    deepLinkParamsRef.current.hostName = window.location.hostname
    deepLinkParamsRef.current.pathName = window.location.pathname
    deepLinkParamsRef.current.metaDescription = description
    deepLinkParamsRef.current.metaTitle = title
    deepLinkParamsRef.current.metaPreviewImage = videoDetails?.video?.thumbnail
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
          videoUrl={videoDetails?.video?.url}
          videoPreviewImage={videoDetails?.video?.thumbnail}
          openGraphDescription={description}
          metaImageWidth={videoDetails?.video?.metadata?.height}
          metaImageHeight={videoDetails?.video?.metadata?.width}
          metaVideoHeight={videoDetails?.video?.metadata?.height}
          metaVideoWidth={videoDetails?.video?.metadata?.width}
          urlToCopy={shareLink}
          author={JSON.stringify(author)}
          description={description}
          openGraphType='video'
          ownerProfileLink={`${process.env.hostname}p/${videoDetails?.user_nickname}`}
          // releaseDate={dateCreated}
          // updateTime={dateModified}
          videoDuration={videoDetails?.video?.metadata?.duration}
          videoType={videoDetails?.video?.metadata?.type} // todo check the res once
        />
        <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: ORG_SCHEMA }} />
        <Player
          videoId={videoDetails?.video?.share_string}
          description={videoDetails?.video?.description}
          videoUrl={videoDetails?.video?.url}
          videoThumbnail={videoDetails?.video?.thumbnail}
          userName={videoDetails?.owner?.nickname}
          userId={videoDetails?.owner?.nickname}
          userProfileImage={videoDetails?.owner?.profile_image}
          showGetAppModal={handleShowDownloadAppPopup}
          onEnded={showGetAppToViewDialog}
          autoplay
          onClick={onClick}
          muted={muted}
          singleVideoView={true}
          roundTableMode={!!loopId}
          roundTableName={videoDetails?.loop?.name}
          rtProfileImage={videoDetails?.loop?.profile_image}
          roundTableId={loopId}
          shareUrl={shareLink}
        >
          <AppActions
            showGetAppModal={handleShowModalAppDownload}
            userName={videoDetails?.owner?.nickname}
            link={videoDetails?.video?.link}
            videoUrl={globalThis?.location?.href}
            videoDescription={videoDetails?.video?.description}
            videoTitle='Genuin'
            deepLinkParams={deepLinkParamsRef.current}
            videoId={videoDetails?.video?.share_string}
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
  try {
    const res = await axios.get(`${process.env.apiurl}/api/v3/public/video_details`, {
      params: {
        video_share_string: video_id
      }
    })
    let videoDetails = null
    if (res?.data?.data) {
      videoDetails = res?.data?.data
      console.log(res?.data)
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
