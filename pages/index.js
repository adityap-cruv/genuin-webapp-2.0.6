import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useBreakpointValue } from '@chakra-ui/react'
import dynamic from 'next/dynamic'

import { HomeNav } from '../components/navbar/home_nav'
import { SEO } from '../components/basic/seo'
import { GenuinLoader } from '../components/basic/genuin_loader'

const AnimatedIndexPage = dynamic(() => import('../components/home/animated_index_page'))
const MobileIndexPage = dynamic(() => import('../components/home/mobile_index_page'))
const DownloadAppPopup = dynamic(() => import('../components/download_app_popup'))

const title = 'Be Genuin - learn, discover, connect.'
const metaImage = 'https://media.begenuin.com/backend_assets/preview.png'
const description =
'Discover videos that level up your life. Learn new things, share your knowledge, and create authentic connections.'
const currentUrl = 'https://begenuin.com'

const Home = () => {
  const [showModalAppDownload, setShowModalAppDownload] = useState(false)
  const handleCloseAppDownload = () => setShowModalAppDownload(false)
  const handleOpenAppDownload = () => setShowModalAppDownload(true)
  const mobile = useBreakpointValue({ base: true, md: false })
  const [{ rtVideos, rtData }, setRTData] = useState({ rtVideos: [], rtData: {} })

  const [isLoadingFake, setIsLoadingFake] = useState(true)
  setTimeout(() => {
    setIsLoadingFake(false)
  }, 100)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const videosData = await axios.get(
          `${process.env.apiurl}/api/v3/public/rt/paginate_videos?chat_id=17bb88b72c80153b`
        )
        const rtDetails = await axios.get(
          `${process.env.apiurl}/api/v3/public/rt/details?chat_id=17bb88b72c80153b`
        )
        const feeds = videosData?.data?.data?.chats
        if (feeds.length > 0) {
          setRTData({ rtVideos: feeds, rtData: rtDetails?.data?.data })
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('error : ', e)
      }
    }
    fetchData()
  }, [])

  const loadMoreVideos = async () => {
    try {
      const res = await axios.get(
        `${process.env.apiurl}/api/v3/public/rt/paginate_videos?chat_id=17bb88b72c80153b&last_video_id=${rtVideos[rtVideos.length - 1].conversation_id}`
      )
      const chats = res?.data?.data?.chats
      if (chats.length > 0) {
        setRTData((old) => ({ rtVideos: old.rtVideos.concat(chats), rtData: old.rtData }))
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('error : ', e)
    }
  }
  return (
    <>
      <SEO
        title={title}
        openGraphTitle={title}
        description={description}
        openGraphDescription={description}
        urlToCopy={currentUrl}
        videoPreviewImage={metaImage}
        includeHead={false}
      />
      <HomeNav variant="light" isContiner showGetAppModal={setShowModalAppDownload}/>
      {isLoadingFake
        ? <>
          <div
            className="bg-gradient-blue h-100 w-100"
            style={{
              position: 'absolute',
              zIndex: -99
            }}>
            <GenuinLoader />
          </div>
        </>
        : <>
          {!mobile && <AnimatedIndexPage
            rtData={{ rtVideos, rtData }}
            loadMoreVideos={loadMoreVideos}
          />
          }
          {mobile &&
            <MobileIndexPage
              rtData={{ rtVideos, rtData }}
              loadMoreVideos={loadMoreVideos}
              showModalAppDownload={handleOpenAppDownload}
            />}
        </>
      }
      <DownloadAppPopup
        show={showModalAppDownload}
        onClose={handleCloseAppDownload}
      />
    </>
  )
}
export default Home
