import { type VideoType, type CommunityType, type PeopleType } from '.'
import { type RankingResType, type LoopResType } from '../../schema/top-resp'
import { type ReactNode } from 'react'
import { useState } from 'react'
import { CommunityTile } from '@/components/community-tile'
import { Swiper, SwiperSlide, useSwiper } from 'swiper/react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CustomAvatar } from '@/components/custom-avatar'
import { Posts } from './posts'
import { LoopItem } from './loops'
import { NoResults } from './no-results'
import { cn } from '@/utils'
import { CustomLink } from '@/router/custom-link'
import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'
import { useSearchBarContext } from '@/components/search-bar/context'

type Props = Partial<{
  communities: CommunityType[]
  loops: LoopResType[]
  people: PeopleType[]
  ranking: RankingResType
  videos: VideoType[]
}>

export function Top({ communities, loops, people, ranking, videos }: Props) {
  const compoArr: ReactNode[] = []

  ranking?.forEach((item: any) => {
    if (item === 'communities' && communities)
      compoArr.push(<CommunityView communities={communities} />)
    if (item === 'loops' && loops && loops.length !== 0)
      compoArr.push(<LoopView loops={loops} />)
    if (item === 'people' && people)
      compoArr.push(<PeopleView people={people} />)
  })
  if (videos) compoArr.push(<VideoView videos={videos} />)
  if (compoArr.length !== 0)
    return (
      <div className='flex flex-col gap-y-4 pb-16 pt-4 sm:py-4'>{compoArr}</div>
    )

  return <NoResults />
}

function CommunityView({ communities }: { communities: CommunityType[] }) {
  const { setView, close } = useSearchBarContext()
  const pathName = usePathNameWithSubdomain()

  return (
    <span>
      <span className='flex justify-between px-4 pb-1'>
        <p className='text-title-3-bold'>Communities</p>
        <p
          className='cursor-pointer text-body-1-demi text-tertiary'
          onClick={() => {
            setView('TABS', 'COMMUNITIES')
          }}>
          See all
        </p>
      </span>
      <div className='relative w-full'>
        <Swiper
          spaceBetween={8}
          slidesPerView={communities.length === 1 ? 1 : 1.2}
          initialSlide={0}
          centeredSlides
          centerInsufficientSlides
          slidesOffsetBefore={16}
          slidesOffsetAfter={16}
          centeredSlidesBounds
          direction='horizontal'>
          {communities.map((community) => (
            <SwiperSlide
              key={community.id}
              className='p-1'>
              <CustomLink
                onClick={close}
                target='_blank'
                href={pathName.community(community.slug)}>
                <CommunityTile
                  redirectOnClick
                  className='hover:bg-tertiary-100 hover:shadow-md'
                  key={community.id}
                  communityDetails={{
                    id: community.id,
                    slug: community.slug,
                    memberCount: community.memberCount,
                    name: community.name ?? '',
                    profileImage: community.profileImage ?? '',
                    type: community.type,
                    description: community.description ?? undefined,
                    brand: community.brand
                      ? {
                          logo: community.brand.logo ?? '',
                          name: community.brand.name ?? '',
                          slug: community.brand.brand_slug ?? '',
                        }
                      : undefined,
                  }}
                />
              </CustomLink>
            </SwiperSlide>
          ))}
          <SlideButtons />
        </Swiper>
      </div>
    </span>
  )
}

function SlideButtons() {
  const slider = useSwiper()
  const [status, setStatus] = useState({
    isStart: true,
    isEnd: slider.slides.length === 1,
  })
  return (
    <>
      {!status.isStart && (
        <div className='absolute left-2 top-1/2 z-50 -translate-y-1/2'>
          <Button
            className='h-10 w-10 rounded-full bg-background drop-shadow-circle-shadow hover:bg-background hover:shadow-md'
            size='custom'
            onClick={() => {
              slider.slidePrev()
              setStatus({ isEnd: slider.isEnd, isStart: slider.isBeginning })
            }}>
            <ChevronLeft className='h-7 stroke-secondary  stroke-[2px]' />
          </Button>
        </div>
      )}
      {!status.isEnd && (
        <div className='absolute right-2 top-1/2 z-50 -translate-y-1/2'>
          <Button
            className='h-10 w-10 rounded-full bg-background/80 drop-shadow-circle-shadow hover:bg-background hover:shadow-md'
            size='custom'
            onClick={() => {
              slider.slideNext()
              setStatus({ isEnd: slider.isEnd, isStart: slider.isBeginning })
            }}>
            <ChevronRight className='h-7 stroke-secondary  stroke-[2px]' />
          </Button>
        </div>
      )}
    </>
  )
}

function LoopView({ loops }: { loops: LoopResType[] }) {
  const { setView } = useSearchBarContext()
  return (
    <span>
      <span className='flex justify-between px-4 pb-2'>
        <p className='text-title-3-bold'>Groups</p>
        <p
          className='cursor-pointer text-body-1-demi text-tertiary'
          onClick={() => {
            setView('TABS', 'LOOPS')
          }}>
          See all
        </p>
      </span>
      <div className='relative w-full'>
        {loops.length === 1 ? (
          <div className='w-full px-4'>
            <LoopItem loop={loops[0]} />
          </div>
        ) : (
          <Swiper
            spaceBetween={8}
            slidesPerView={1.2}
            breakpoints={{
              0: { slidesPerView: 1 },
              350: { slidesPerView: 1.2 },
            }}
            initialSlide={0}
            centeredSlides
            centerInsufficientSlides
            slidesOffsetBefore={16}
            slidesOffsetAfter={16}
            centeredSlidesBounds
            direction='horizontal'>
            {loops.map((item) => (
              <SwiperSlide
                key={item.chat_id}
                className='w-full p-1'>
                <LoopItem
                  key={item.chat_id}
                  loop={item}
                />
              </SwiperSlide>
            ))}
            <SlideButtons />
          </Swiper>
        )}
      </div>
    </span>
  )
}

function PeopleView({ people }: { people: PeopleType[] }) {
  const { setView, close } = useSearchBarContext()
  const pathName = usePathNameWithSubdomain()
  return (
    <div>
      <div className='flex justify-between px-4 pb-2'>
        <p className='text-title-3-bold'>People</p>
        <p
          className='cursor-pointer text-body-1-demi text-tertiary'
          onClick={() => {
            setView('TABS', 'PEOPLE')
          }}>
          See all
        </p>
      </div>
      <div className='flex gap-x-2 overflow-auto __gen__sdk__hide__scrollbar px-4'>
        {people.slice(0, 4).map((person) => {
          return (
            <CustomLink
              target='_blank'
              onClick={close}
              href={
                person.brand
                  ? pathName.brand(person.brand.brand_slug)
                  : pathName.profile(person.userName)
              }
              className={cn('flex w-fit flex-col items-center gap-y-1')}
              key={person.id}>
              <CustomAvatar
                fallbackString={person.name ?? ''}
                imageUrl={person.profileImage ?? ''}
                isAvatar={person.isAvatar}
                className='h-16 w-16'
              />
              <p className='line-clamp-1 break-all text-cap-1-demi'>{`@${person.userName}`}</p>
            </CustomLink>
          )
        })}
      </div>
    </div>
  )
}

function VideoView({ videos }: { videos: VideoType[] }) {
  const { setView } = useSearchBarContext()
  return (
    <div>
      <div className='flex justify-between px-4 pb-2'>
        <p className='text-title-3-bold'>Posts</p>
        <p
          className='cursor-pointer text-body-1-demi text-tertiary'
          onClick={() => {
            setView('TABS', 'POSTS')
          }}>
          See all
        </p>
      </div>
      <Posts videos={videos} />
    </div>
  )
}
