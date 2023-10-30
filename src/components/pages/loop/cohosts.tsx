import { Loader } from '@components/ui/loader'
import Link from 'next/link'
import { getLoopCohosts } from '@lib/api/loop'
import { PATH_NAME } from '@lib/utils/constants/path'
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar'
import { getAvatarFallback } from '@lib/utils'

// todo configure error here.
export function Cohosts({ loopId }: { loopId: string }) {
  const { data, isLoading, isError } = getLoopCohosts(loopId)
  return (
    <div className="h-2/3 pt-3">
      <p className="text-title-lg">Co-Hosts</p>
      {isLoading && <Loader size="md" />}
      {isError && <div>Something went wrong...</div>}
      {data && (
        <div className="grid h-full w-full columns-2 grid-cols-2 overflow-auto pb-11 md:grid-cols-3 xl:grid-cols-4">
          {data.members.map((member, index) => (
            <Link key={index} href={{ pathname: PATH_NAME.profile(member.nickname) }}>
              <CohostTile
                image={member.profile_image || ''}
                subtitle={member.bio || ''}
                title={'@' + member.nickname}
                userName={member.name ?? 'Un Known'}
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
        <Avatar className="h-20 w-20 bg-red-40">
          <AvatarImage src={image} />
          <AvatarFallback>
            <p className="text-title-xl text-monochrome-white">{getAvatarFallback(userName)}</p>
          </AvatarFallback>
        </Avatar>
        <p className="my-1 line-clamp-1 break-all text-center text-title-sm">{title}</p>
        <p className="line-clamp-3 break-all text-center text-cap-lg lg:line-clamp-4">{subtitle}</p>
      </div>
    </div>
  )
}
