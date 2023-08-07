import React, { useRef, useState, useEffect } from 'react'
import axios from 'axios'
import { Player } from '../components/player/player'
import { Layout } from '../components/layout/layout'
import { GetAppModal } from '../components/basic/get_app_modal'
import { Error } from '../components/basic/error'
import { SEO } from '../components/basic/seo'
import { AppActions } from '../components/basic/app_actions'
import { useDisclosure } from '@chakra-ui/react'
import dynamic from 'next/dynamic'

const DownloadAppPopup = dynamic(() => import('../components/download_app_popup'))

const Video = (props) => {
  const {
    video_url,
    video_url_m3u8,
    video_preview_image,
    description,
    created_at,
    updated_at,
    // tags,
    share_string,
    video_id_to_use,
    video_thumbnail,
    user_name,
    user_nickname,
    user_profile_image,
    link,
    geshc
  } = props
  // const [showModalWelcome, setShowModalWelcome] = useState(true);
  // const handleCloseWelcome = () => setShowModalWelcome(false);
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

  const { isOpen, onOpen, onClose } = useDisclosure()
  // const tags_string = tags !== null && tags !== undefined && tags.replace(/\s+/g, '') !== '' ? ` #${tags.split(',').join(' #')}` : ''
  const ld_description = `Watch videos from ${user_name || '@' + user_nickname} on Genuin`
  const title_name = `${description} • Watch and react on Genuin`
  const share_url = `${process.env.hostname}${share_string}`
  const ORG_SCHEMA = JSON.stringify({
    '@context': 'http://schema.org',
    '@type': 'VideoObject',
    id: share_url,
    url: share_url,
    name: title_name,
    isPartOf: `${process.env.hostname}#website`,
    image: `${video_thumbnail}/#primaryimage`,
    thumbnailUrl: video_thumbnail,
    contentUrl: video_url,
    embedUrl: video_url,
    author: {
      '@type': 'Person',
      name: '@' + user_nickname,
      url: `${process.env.hostname}p/${user_nickname}`
    },
    publisher: {
      '@type': 'Organization',
      name: 'Genuin',
      url: process.env.hostname
    },
    description: ld_description,
    inLanguage: 'en-US',
    uploadDate: new Date(created_at).toISOString(),
    dateCreated: new Date(created_at).toISOString(),
    dateModified: new Date(updated_at).toISOString(),
    datePublished: new Date(created_at).toISOString(),
    potentialAction: [
      {
        '@type': 'WatchAction',
        target: share_url,
        image: video_thumbnail
      }
    ]
  })
  deepLinkParamsRef.current.metaDescription = ld_description
  deepLinkParamsRef.current.metaTitle = title_name
  deepLinkParamsRef.current.metaPreviewImage = video_preview_image

  useEffect(() => {
    deepLinkParamsRef.current.hostName = window.location.hostname
    deepLinkParamsRef.current.pathName = window.location.pathname
    const ls = window.location.href.split('/')
    if (ls && ls.length === 4) {
      onOpen()
    }
  }, [])

  const setProfileUrl = () => {
    // console.log("Setting profile url in public video individual")
    window.location.href = `${process.env.hostname}p/${user_nickname}`
  }

  // todo: remove it
  const [muted, setMuted] = useState(true)
  const onClick = () => {
    setMuted(old => !old)
  }
  return !video_url ? (
    <Error />
  ) : (
    <>
      <Layout>
        <SEO
          title={title_name}
          openGraphTitle={`${user_nickname} @ Genuin`}
          videoUrl={video_url}
          videoPreviewImage={video_preview_image}
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
          videoUrl={video_url_m3u8 ?? video_url}
          videoThumbnail={video_thumbnail}
          userName={user_nickname}
          userId={user_nickname}
          userProfileImage={user_profile_image}
          showGetAppModal={handleShowDownloadAppPopup}
          onEnded={showGetAppToViewDialog}
          autoplay
          onClickOutsideOfVideo={() => { setProfileUrl(); onClose() }}
          onClick={onClick}
          muted={muted}
        >
          <AppActions
            showGetAppModal={handleShowModalAppDownload}
            userName={user_nickname}
            link={link}
            videoUrl={globalThis?.location?.href}
            videoDescription={description}
            videoTitle='Genuin'
            deepLinkParams={deepLinkParamsRef.current}
            sourceId={share_string}
          />
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
Video.getInitialProps = async ({ query: { video_id, geshc } }) => {
  const url = `${process.env.apiurl}/api/v3/public/pv/?video_id=${video_id}`
  return axios
    .get(url)
    .then((response) => {
      const resObj = response.data.data
      const video_id_to_use = resObj.share_string
      Object.assign(resObj, {
        video_id,
        video_id_to_use,
        geshc
      })
      return Promise.resolve(resObj)
    })
    .catch((_err) => {
      return Promise.resolve({})
    })
}
export default Video
