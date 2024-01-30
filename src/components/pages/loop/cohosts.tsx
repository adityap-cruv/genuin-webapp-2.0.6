import { Loader } from '@components/ui/loader'
import Link from 'next/link'
import { getLoopCohosts } from '@lib/api/loop'
import { PATH_NAME } from '@lib/utils/constants/path'
import { CustomAvatar } from '@components/custom/custom-avatar'

// todo configure error here.
export function Cohosts({ loopId }: { loopId: string }) {
  const { data, isLoading, isError } = getLoopCohosts(loopId, 'members')
  const cohosts = data?.users
  return (
    <div className="h-2/3 pt-3">
      <p className="text-title-2-bold">Co-Hosts</p>
      {isLoading && <Loader size="md" />}
      {isError && <div>Something went wrong...</div>}
      {cohosts && (
        <div className="grid h-full w-full columns-2 grid-cols-2 overflow-auto pb-11 md:grid-cols-3 xl:grid-cols-4">
          {cohosts.map((item: any, index: any) => (
            <Link key={index} href={{ pathname: PATH_NAME.profile(item.user.nickname) }}>
              <CohostTile
                image={item.user.profile_image || ''}
                subtitle={item.user.bio || ''}
                title={'@' + item.user.nickname}
                userName={item.user.name ?? 'Unknown'}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

interface CohostTileProps {
  image: string
  title: string
  subtitle: string
  userName: string
}

function CohostTile({ image, title, subtitle, userName }: CohostTileProps) {
  return (
    <div className="relative m-1 h-44 rounded-md border-2  border-secondary duration-300 hover:scale-95 md:h-44 lg:h-52">
      <div className="flex h-full w-full flex-col items-center justify-center p-2">
        <CustomAvatar className="h-20 w-20 bg-red-40" imageUrl={image} fallbackString={userName} isAvatar={false} />
        <p className="my-1 line-clamp-1 break-all text-center text-body-1-bold">{title}</p>
        <p className="line-clamp-3 break-all text-center text-cap-1-demi lg:line-clamp-4">{subtitle}</p>
      </div>
    </div>
  )
}
