import Player from '@components/common/player'

interface Props {
  videoData: any
}

export function MainComponent({ videoData = undefined }: Props) {
  if (videoData) return <Player videoData={videoData} />
}
