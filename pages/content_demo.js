import React, { useState, useRef } from 'react'
import axios from 'axios'

import { Layout } from '../components/layout'
import { GetAppModal } from '../components/basic/get_app_modal'
import { TopNav } from '../components/basic/top_nav_content_demo'
import Videos from '../components/basic/videos_content_demo'
import { Error } from '../components/basic/error'

const Profile = ({
  user,
  all_videos = [],
  revenue_enabled = false,
  is_rt = false,
  end_of_videos = false,
  chat_id,
  rt_details,
  infy_params = {},
  context_reel
}) => {
  const prepareFeedVideos = (videos = []) => {
    return videos.reduce((res, { video_type, video }) => {
      if (video_type === 'rt') {
        return res.concat(({ video_type, share_string: video.share_string, video }))
      }

      return res.concat(({ video_type, video }))
    }, [])
  }
  const [videos, setVideos] = useState(prepareFeedVideos(all_videos))

  const getAppComponentRef = useRef(() => null)
  const [noMoreVideos, setNoMoreVideos] = useState(end_of_videos)
  const [showModalAppDownload, setShowModalAppDownload] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const loadMoreVideos = () => {
    if (!isLoading && !is_rt && !noMoreVideos) {
      getMoreVideosPublic()
    } else if (!isLoading && is_rt && !noMoreVideos) {
      getMoreVideosRT()
    } else {
      // TODO: what to do if no more videos or it is loading ..........
      // console.log("Not calling...")
    }
  }

  const getMoreVideosPublic = async () => {
    setIsLoading(true)
    const res = await axios.get(
      `${process.env.apiurl
      }/api/v3/public/profile_videos?user_id=${user.user_id}&video_types[]=public_video&last_video_type=public_video&last_video_id=${videos[videos.length - 1]?.video?.video_id
      }`
    )

    const newVideos = res?.data?.data?.videos || []
    res?.data?.data?.end_of_videos ? setNoMoreVideos(true) : setNoMoreVideos(false)

    if (newVideos.length !== 0) {
      setVideos(videos.concat(prepareFeedVideos(newVideos)))
    }
    setIsLoading(false)
  }

  const prepareRTVideos = (videos) => {
    const tempData = []
    videos.forEach(function (v) {
      const videoObj = {
        video_type: 'rt',
        share_string: rt_details.share_string,
        video: {
          owner: v.owner,
          thumbnail_url: v.thumbnail_url,
          thumbnail_url_s: v.thumbnail_url_s,
          thumbnail_url_l: v.thumbnail_url_l,
          video_url: v.video_url,
          video_url_m3u8: v.video_url_m3u8,
          link: v.link,
          meta_data: v.meta_data,
          conversation_id: v.conversation_id,
          conversation_at: v.conversation_at,
          no_of_views: v.no_of_views,
          no_of_comments: v.no_of_comments,
          video_thumbnail: v.video_thumbnail,
          share_url: `${process.env.hostname}rt/${rt_details.share_string}?v=${v.share_string}`,
          share_string: v.share_string,
          rt_share_string: v.share_string,
          description: rt_details.group.group_description,
          group_name: rt_details.group.group_name,
          group_dp: rt_details.group.dp,
          chat_id: rt_details.chat_id
        }
      }
      tempData.push(videoObj)
    })
    return tempData
  }

  // --------> IN CASE OF PAGINATION IN RT <---------------------------------------------------------------------------
  const getMoreVideosRT = async () => {
    const res = await axios.get(
      `${process.env.apiurl}/api/v3/public/rt/paginate_videos?chat_id=${chat_id}&last_video_id=${videos[videos.length - 1].video.conversation_id}`
    )
    const newVideos = res?.data?.data?.chats || []
    res?.data?.data?.end_of_videos ? setNoMoreVideos(true) : setNoMoreVideos(false)
    if (newVideos.length !== 0) {
      setVideos(videos.concat(prepareFeedVideos(prepareRTVideos(newVideos))))
    }
  }
  // ---------------------------------------------------------------------------------------------------------------------

  const handleShowModalAppDownload = (message = () => null) => {
    getAppComponentRef.current = message
    setShowModalAppDownload(true)
  }

  const handleCloseAppDownload = () => {
    getAppComponentRef.current = () => null
    setShowModalAppDownload(false)
  }

  return (
    <>
      {(rt_details || user) ? <Layout className="content-demo">
        <TopNav hideBurgerMenu={true} showGetAppModal={handleShowModalAppDownload} variant='light' />
        <Videos
          videos={videos}
          loadMoreVideos={loadMoreVideos}
          revenue_enabled={revenue_enabled}
          user={user}
          infy_params={infy_params}
          disableWatch={true}
          contextReel={context_reel}
        />
        <GetAppModal
          show={showModalAppDownload}
          onClose={handleCloseAppDownload}
          TextNode={getAppComponentRef.current}
        />
      </Layout> : <Error />}
    </>
  )
}

Profile.getInitialProps = async ({
  query: {
    value,
    revenue_enabled,
    company_id,
    tag_id,
    domain,
    publisher_name,
    context_reel,
    ad_breaks,
    site_page,
    site_domain,
    site_name,
    site_keywords,
    site_publisher_cat,
    site_publisher_domain,
    site_publisher_name,
    device_geo_zip,
    device_ip,
    device_geo_city,
    device_ifa,
    device_model,
    device_geo_country
  }
}) => {
  let nickname, rt
  context_reel = context_reel === 'true'
  const infy_params = {
    t: tag_id || 2084,
    c: company_id || 1094,
    ad_breaks,
    site_publisher_domain,
    site_publisher_name,
    site_page,
    site_domain,
    site_name,
    site_keywords,
    site_publisher_cat,
    pdomain: domain,
    pname: publisher_name,
    device_geo_zip,
    device_ip,
    device_geo_city,
    device_ifa,
    device_model,
    device_geo_country
  }

  if (value !== undefined &&
    value !== null &&
    value !== '') {
    if (value.indexOf('p_') === 0) {
      nickname = value.substring(2)
    }

    if (value.indexOf('rt_') === 0) {
      rt = value.substring(3)
    }
  }

  if (
    nickname !== undefined &&
    nickname !== null &&
    nickname !== ''
  ) {
    try {
      const all_videos = await axios.get(
        `${process.env.apiurl}/api/v3/public/profile_videos?user_id=${nickname}&video_types[]=public_video`
      )
      const user = await axios.get(
        `${process.env.apiurl}/api/v3/public/user/details?nickname=${nickname}`
      )
      return {
        user: user?.data?.data,
        all_videos: all_videos?.data?.data?.videos,
        is_prop_loaded: true,
        revenue_enabled: revenue_enabled === 'true',
        end_of_videos: all_videos?.data?.data?.end_of_videos,
        infy_params,
        context_reel
      }
    } catch (error) {
      return {}
    }
  } else if (
    rt !== undefined &&
    rt !== null &&
    rt !== ''
  ) {
    try {
      const videos = await axios.get(
        `${process.env.apiurl}/api/v3/public/rt/paginate_videos?chat_id=${rt}`
      )
      const rt_details = await axios.get(
        `${process.env.apiurl}/api/v3/public/rt/details?chat_id=${rt}`
      )
      const rt_data = rt_details?.data?.data
      const rt_videos = []
      if (rt_details !== undefined && rt_details !== null &&
        rt_details.data !== undefined && rt_details.data !== null &&
        rt_details !== undefined && rt_details !== null &&
        videos !== undefined && videos !== null &&
        videos.data !== undefined && videos.data !== null &&
        videos.data.data !== undefined && videos.data.data !== null &&
        videos.data.data.chats !== undefined && videos.data.data.chats !== null &&
        videos.data.data.chats.length > 0) {
        videos.data.data.chats.forEach(function (v) {
          const videoObj = {
            video_type: 'rt',
            share_string: rt_details.data.data.share_string,
            video: {
              owner: v.owner,
              thumbnail_url: v.thumbnail_url,
              thumbnail_url_s: v.thumbnail_url_s,
              thumbnail_url_l: v.thumbnail_url_l,
              video_url: v.video_url,
              video_url_m3u8: v.video_url_m3u8,
              link: v.link,
              meta_data: v.meta_data,
              conversation_id: v.conversation_id,
              conversation_at: v.conversation_at,
              no_of_views: v.no_of_views,
              no_of_comments: v.no_of_comments,
              video_thumbnail: v.video_thumbnail,
              share_url: `${process.env.hostname}rt/${rt_details.data.data.share_string}?v=${v.share_string}`,
              share_string: v.share_string,
              rt_share_string: v.share_string,
              description: rt_data.group.group_description,
              group_name: rt_data.group.group_name,
              group_dp: rt_data.group.dp,
              chat_id: rt_data.chat_id
            }
          }
          rt_videos.push(videoObj)
        })
      }
      return {
        all_videos: rt_videos,
        is_prop_loaded: true,
        revenue_enabled: revenue_enabled === 'true',
        is_rt: true,
        chat_id: rt,
        rt_details: rt_data,
        infy_params,
        context_reel
      }
    } catch (e) {
      console.log('error : ', e)
      return Promise.resolve({})
    }
  } else {
    return Promise.resolve({})
  }
}
export default Profile
