import { useProfileStore } from '@components/states/profile/profileState'

function GenuinVideos() {
  return <div>genuin videos....</div>
}

function LoopVideos() {
  return <div>Loop Videos..</div>
}

function AllVideos() {
  const { profileData, allVideos, setAllVideos } = useProfileStore()
  console.log('profileData::', profileData)
  return <div>All videos...</div>
}

export const VideosTab = {
  genuin: GenuinVideos,
  loop: LoopVideos,
  all: AllVideos,
}
