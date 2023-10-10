import { Loader } from '@components/ui/loader'
import { getCommunityVideos } from '@lib/api/community'

interface Props {
  communityHandle: string
}

export function CommunityReels({ communityHandle }: Props) {
  return (
    <div className="h-full w-full">
      <InnerComponent communityHandle={communityHandle} />
    </div>
  )
}

function InnerComponent({ communityHandle }: Props) {
  const { data, isLoading, isError } = getCommunityVideos(communityHandle)
  if (isLoading) return <Loader size="lg" />
  if (isError) return <div>Something went wrong with api.</div>
  return <div>{data[0].owner.nickname}</div>
}
