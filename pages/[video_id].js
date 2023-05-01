import React, { useRef, useState, useEffect } from 'react'
import axios from 'axios'
import { Player } from '../components/player/player'
import { Layout } from '../components/layout/layout'
import { GetAppModal } from '../components/basic/get_app_modal'
import { Error } from '../components/basic/error'
import { SEO } from '../components/basic/seo'
import { AppActions } from '../components/basic/app_actions'
import { useDisclosure } from '@chakra-ui/react'
import { datadogLogs } from '@datadog/browser-logs'
import dynamic from 'next/dynamic'

const DownloadAppPopup = dynamic(() => import('../components/download_app_popup'))

const Video = (props) => {
  const {
    videoUrl,
    video_url_m3u8,
    videoPreviewImage,
    description,
    created_at,
    updated_at,
    // tags,
    share_string,
    video_id_to_use,
    videoThumbnail,
    userName,
    userNickname,
    userProfileImage,
    link
  } = props
  // const [showModalWelcome, setShowModalWelcome] = useState(true);
  // const handleCloseWelcome = () => setShowModalWelcome(false);
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

  const { isOpen, onOpen, onClose } = useDisclosure()
  // const tags_string = tags !== null && tags !== undefined && tags.replace(/\s+/g, '') !== '' ? ` #${tags.split(',').join(' #')}` : ''
  const ld_description = `Watch videos from ${userName || '@' + userNickname} on Genuin`
  const title_name = `${description} • Watch and react on Genuin`
  const share_url = `${process.env.hostname}${share_string}`
  const ORG_SCHEMA = JSON.stringify({
    '@context': 'http://schema.org',
    '@type': 'VideoObject',
    id: share_url,
    url: share_url,
    name: title_name,
    isPartOf: `${process.env.hostname}#website`,
    image: `${videoThumbnail}/#primaryimage`,
    thumbnailUrl: videoThumbnail,
    contentUrl: videoUrl,
    embedUrl: videoUrl,
    author: {
      '@type': 'Person',
      name: '@' + userNickname,
      url: `${process.env.hostname}p/${userNickname}`
    },
    publisher: {
      '@type': 'Organization',
      name: 'Genuin',
      url: process.env.hostname
    },
    description: ld_description,
    inLanguage: 'en-US',
    uploadDate: created_at,
    dateCreated: created_at,
    dateModified: updated_at,
    datePublished: created_at,
    potentialAction: [
      {
        '@type': 'WatchAction',
        target: share_url,
        image: videoThumbnail
      }
    ]
  })

  useEffect(() => {
    datadogLogs.logger.info('Video Watched')
    const ls = window.location.href.split('/')
    if (ls && ls.length === 4) {
      onOpen()
    }
  }, [])

  const setProfileUrl = () => {
    // console.log("Setting profile url in public video individual")
    window.location.href = `${process.env.hostname}p/${userNickname}`
  }

  // todo: remove it
  const [muted, setMuted] = useState(true)
  const onClick = () => {
    setMuted(old => !old)
  }

  return !videoUrl ? (
    <Error />
  ) : (
    <>
      <Layout>
        <SEO
          title={title_name}
          openGraphTitle={`${userNickname} @ Genuin`}
          videoUrl={videoUrl}
          videoPreviewImage={videoPreviewImage}
          description={ld_description}
          openGraphDescription={description || ' '}
          metaImageWidth={1200}
          metaImageHeight={630}
          urlToCopy={process?.env?.hostname + '/' + video_id_to_use} />
        <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: ORG_SCHEMA }} />
        {isOpen && <Player
          key={video_id_to_use ?? `${Math.random()}`}
          video_id_to_use={video_id_to_use}
          description={description}
          videoUrl={video_url_m3u8 ?? videoUrl}
          videoThumbnail={videoThumbnail}
          userName={userNickname}
          userId={userNickname}
          userProfileImage={userProfileImage}
          showGetAppModal={handleShowDownloadAppPopup}
          onEnded={showGetAppToViewDialog}
          autoplay
          onClickOutsideOfVideo={() => { setProfileUrl(); onClose() }}
          onClick={onClick}
          muted={muted}
        >
          <AppActions
            showGetAppModal={handleShowModalAppDownload}
            userName={userNickname}
            link={link}
            videoUrl={globalThis?.location?.href}
            videoDescription={description}
            videoTitle='Genuin' />
        </Player>}

        <GetAppModal
          show={showModalAppDownload}
          onClose={handleCloseAppDownload}
          TextNode={getAppComponentRef.current} />
        <DownloadAppPopup
          show={showDownloadAppPopup}
          onClose={handleCloseDownloadAppPopup}
        />
        {/* <WelcomeModal show={showModalWelcome} onClose={handleCloseWelcome} /> */}
      </Layout>
    </>
  )
}
Video.getInitialProps = async ({ query: { video_id } }) => {
  const url = `${process.env.apiurl}/api/v3/public/pv/?video_id=${video_id}`
  return axios
    .get(url)
    .then((response) => {
      const resObj = response.data.data
      const video_id_to_use = resObj.share_string
      Object.assign(resObj, {
        video_id,
        video_id_to_use
      })
      return Promise.resolve(resObj)
    })
    .catch((_err) => {
      return Promise.resolve({})
    })
}
export default Video
