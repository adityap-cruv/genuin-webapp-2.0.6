import { type VideoType } from '.'
import { CustomAvatar } from '@/components/custom-avatar'
import { PlayIcon } from '@/components/icons/play-icon'
import { NoResults } from './no-results'
import { CustomImage } from '@/components/custom-image'
import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'
import { useSearchBarContext } from '@/components/search-bar/context'

export function Posts({ videos }: { videos?: VideoType[] }) {
  const { close } = useSearchBarContext()
  const pathName = usePathNameWithSubdomain()

  if (videos)
    return (
      <div className='mb-2 grid grid-cols-2 gap-4 px-2'>
        {videos.map((item, index) => (
          <a
            target='_blank'
            href={pathName.video(item.slug)}
            key={index}
            onClick={close}
            className='group/video aspect-reel relative duration-300 hover:cursor-pointer'>
            <CustomImage
              alt={item.description ?? 'video thumbnail'}
              src={item.thumbnail ?? ''}
              className='rounded-xl w-full h-full object-contain aspect-reel'
            />
            <div className='absolute bottom-2 left-2'>
              <a
                target='_blank'
                href={pathName.profile(item.owner.userName)}>
                <div className='flex w-full gap-2 items-center'>
                  <CustomAvatar
                    className='bg-red-40 h-6 w-6'
                    imageUrl={item.owner.profileImage}
                    isAvatar={item.owner.isAvatar}
                    fallbackString={item.owner.userName}
                  />
                  <p className='ml- line-clamp-1 break-all text-body-1-bold text-white'>
                    @{item.owner.userName}
                  </p>
                </div>
              </a>
            </div>
            <div className='absolute inset-0  hidden h-full w-full items-center justify-center rounded-lg bg-black/40 group-hover/video:flex'>
              <PlayIcon />
            </div>
          </a>
        ))}
      </div>
    )

  return <NoResults />
}
