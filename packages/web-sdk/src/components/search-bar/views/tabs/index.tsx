import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useQuery } from '@tanstack/react-query'
import { getTopResults } from '../../api'
import { Top } from './top'
import { People } from './people'
import { Communities } from './communities'
import { Posts } from './posts'
import { Loops } from './loops'
import { Shimmer } from '@/components/ui/shimmer'
import { useSearchBarContext } from '@/components/search-bar/context'

export type CommunityType = {
  id: string
  memberCount: number
  description?: string | null
  handle: string
  slug: string
  profileImage?: string | null
  name?: string | null
  type: number
  brand?: BrandType | null | undefined
}

export type BrandType = {
  brand_id: number
  name: string | null
  subdomain: string | null
  logo: string | null
  created_at: number
  brand_web_logo: string | null
  favicon: string
  brand_system_user_id: string | null
  brand_slug: string
}

export type LoopType = {
  slug: string
  id: string
  name?: string | null
}

export type PeopleType = {
  id: string
  name?: string | null
  userName: string
  bio?: string | null
  profileImage?: string | null
  isAvatar: boolean
  brand?:
    | {
        brand_id: number
        brand_slug: string
      }
    | null
    | undefined
}

export type VideoType = {
  id: string
  owner: {
    userName: string
    profileImage: string
    isAvatar: boolean
  }
  description?: string | null
  thumbnail: string
  slug: string
}

const TABS = [
  { value: 'TOP', label: 'Top' },
  { value: 'POSTS', label: 'Posts' },
  { value: 'COMMUNITIES', label: 'Communities' },
  { value: 'LOOPS', label: 'Groups' },
  { value: 'PEOPLE', label: 'People' },
]

export default function Component() {
  const { defaultTab, setView, keyword } = useSearchBarContext()

  const { data, isLoading } = useQuery({
    queryFn: async () => await getTopResults(keyword),
    queryKey: ['top', 'search', keyword],
  })

  if (isLoading) return <CompShimmer />

  return (
    <Tabs
      className='h-full w-full'
      defaultValue={defaultTab}
      value={defaultTab}>
      <TabsList className='sticky top-0 z-10 overflow-auto w-full border-b border-b-secondary __gen__sdk__hide__scrollbar'>
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            asChild
            className='px-2'
            onClick={() => setView('TABS', tab.value as any)}>
            <p className='text-body-1-bold'>{tab.label}</p>
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent
        value='TOP'
        className='overflow-auto pb-10'>
        <Top
          communities={data?.communities}
          loops={data?.loops ?? undefined}
          people={data?.people}
          ranking={data?.rankings}
          videos={data?.videos}
        />
      </TabsContent>
      <TabsContent
        value='POSTS'
        className='overflow-auto pb-10'>
        <div className='pb-16 pt-4 sm:py-4'>
          <Posts videos={data?.videos} />
        </div>
      </TabsContent>
      <TabsContent
        value='COMMUNITIES'
        className='overflow-auto pb-10'>
        <Communities communities={data?.communities} />
      </TabsContent>
      <TabsContent
        value='LOOPS'
        className='overflow-auto pb-10'>
        <Loops loops={data?.loops ?? undefined} />
      </TabsContent>
      <TabsContent
        value='PEOPLE'
        className='overflow-auto pb-10'>
        <People people={data?.people} />
      </TabsContent>
    </Tabs>
  )
}

function CompShimmer() {
  return (
    <div>
      <div className='flex h-full w-full justify-evenly gap-x-2 border-b border-tertiary-200 p-2'>
        <Shimmer className='h-4 flex-1' />
        <Shimmer className='h-4 flex-1' />
        <Shimmer className='h-4 flex-1' />
        <Shimmer className='h-4 flex-1' />
        <Shimmer className='h-4 flex-1' />
      </div>
      <div className='flex flex-col gap-y-3 px-4 py-4'>
        <Shimmer className='h-4 w-1/4' />
        <div className='flex w-full flex-col gap-y-3 rounded-md border border-tertiary-200 p-4'>
          <span className='flex w-full items-center gap-x-2'>
            <Shimmer className='h-12 w-12 rounded-full p-4' />
            <span className='flex w-full flex-col gap-y-2'>
              <Shimmer className='h-4 w-1/3' />
              <Shimmer className='h-4 w-1/4' />
            </span>
          </span>
          <Shimmer className='h-4 w-full' />
          <Shimmer className='h-4 w-full' />
        </div>
        <Shimmer className='h-4 w-1/4' />
        <div className='flex gap-x-4 px-4'>
          <div className='flex flex-1 flex-col items-center gap-y-2'>
            <Shimmer className='h-14 w-14 rounded-full' />
            <Shimmer className='h-4 w-full' />
          </div>
          <div className='flex flex-1 flex-col items-center gap-y-2'>
            <Shimmer className='h-14 w-14 rounded-full' />
            <Shimmer className='h-4 w-full' />
          </div>
          <div className='flex flex-1 flex-col items-center gap-y-2'>
            <Shimmer className='h-14 w-14 rounded-full' />
            <Shimmer className='h-4 w-full' />
          </div>
          <div className='flex flex-1 flex-col items-center gap-y-2'>
            <Shimmer className='h-14 w-14 rounded-full' />
            <Shimmer className='h-4 w-full' />
          </div>
        </div>
        <Shimmer className='h-4 w-1/4' />
        <div className=' relative h-48 w-full overflow-clip rounded-xl border border-tertiary-200'>
          <div className='flex h-1/3 w-full flex-col justify-center gap-y-2 px-4 '>
            <Shimmer className='h-4 w-1/3' />
            <Shimmer className='h-4 w-1/2' />
          </div>
          <div className='flex h-2/3 w-full flex-col justify-center gap-y-2 border-t  border-tertiary-200 px-4 '>
            <Shimmer className='h-4 w-1/5' />
            <Shimmer className='h-4 w-1/2' />
            <Shimmer className='h-4 w-1/3' />
            <Shimmer className='h-4 w-1/2' />
          </div>
          <div className='absolute right-4 top-1/2 h-5/6 w-1/4 -translate-y-1/2'>
            <Shimmer className='h-full w-full rounded-md' />
          </div>
        </div>
      </div>
    </div>
  )
}
