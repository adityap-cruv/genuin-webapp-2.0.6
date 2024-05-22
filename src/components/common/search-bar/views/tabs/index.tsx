import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { useSearchBarStore } from '../../store'
import { useQuery } from '@tanstack/react-query'
import { getTopResults } from '../../api'
import { Top } from './top'
import { People } from './people'
import { Communities } from './communities'
import { Posts } from './posts'
import { Loops } from './loops'
import { Shimmer } from '@components/ui/shimmer'

export type CommunityType = {
  id: string
  memberCount: number
  description?: string | null
  handle: string
  slug: string
  profileImage?: string | null
  name?: string | null
  type?: number | null
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

export default function Component() {
  const { defaultTab, setView, keyword } = useSearchBarStore()

  const { data, isLoading } = useQuery({
    queryFn: async () => await getTopResults(keyword),
    queryKey: ['top', 'search', keyword],
  })

  if (isLoading) return <CompShimmer />

  return (
    <Tabs className="h-full w-full" defaultValue={defaultTab} value={defaultTab}>
      <TabsList className="sticky top-0 z-10 flex w-full border-b border-b-monochrome-8 bg-monochrome-white [&_p]:text-body-1-bold">
        <TabsTrigger
          value="TOP"
          className="px-0"
          onClick={() => {
            setView('TABS', 'TOP')
          }}>
          <p className="text-body-1-bold">Top</p>
        </TabsTrigger>
        <TabsTrigger
          value="POSTS"
          className="px-0"
          onClick={() => {
            setView('TABS', 'POSTS')
          }}>
          <p className="text-body-1-bold">Posts</p>
        </TabsTrigger>
        <TabsTrigger
          value="COMMUNITIES"
          onClick={() => {
            setView('TABS', 'COMMUNITIES')
          }}>
          <p className="text-body-1-bold">Communities</p>
        </TabsTrigger>
        <TabsTrigger
          className="px-0"
          value="LOOPS"
          onClick={() => {
            setView('TABS', 'LOOPS')
          }}>
          <p className="text-body-1-bold">Loops</p>
        </TabsTrigger>
        <TabsTrigger
          value="PEOPLE"
          onClick={() => {
            setView('TABS', 'PEOPLE')
          }}>
          <p className="text-body-1-bold">People</p>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="TOP" className="overflow-auto pb-10">
        <Top
          communities={data?.communities}
          loops={data?.loops ?? undefined}
          people={data?.people}
          ranking={data?.rankings}
          videos={data?.videos}
        />
      </TabsContent>
      <TabsContent value="POSTS" className="overflow-auto pb-10">
        <div className="pb-16 pt-4 sm:py-4">
          <Posts videos={data?.videos} />
        </div>
      </TabsContent>
      <TabsContent value="COMMUNITIES" className="overflow-auto pb-10">
        <Communities communities={data?.communities} />
      </TabsContent>
      <TabsContent value="LOOPS" className="overflow-auto pb-10">
        <Loops loops={data?.loops ?? undefined} />
      </TabsContent>
      <TabsContent value="PEOPLE" className="overflow-auto pb-10">
        <People people={data?.people} />
      </TabsContent>
    </Tabs>
  )
}

function CompShimmer() {
  return (
    <div>
      <div className="flex h-full w-full justify-evenly gap-x-2 border-b border-tertiary-200 p-2">
        <Shimmer className="h-4 flex-1" />
        <Shimmer className="h-4 flex-1" />
        <Shimmer className="h-4 flex-1" />
        <Shimmer className="h-4 flex-1" />
        <Shimmer className="h-4 flex-1" />
      </div>
      <div className="flex flex-col gap-y-3 px-4 py-4">
        <Shimmer className="h-4 w-1/4" />
        <div className="flex w-full flex-col gap-y-3 rounded-md border border-tertiary-200 p-4">
          <span className="flex w-full items-center gap-x-2">
            <Shimmer className="h-12 w-12 rounded-full p-4" />
            <span className="flex w-full flex-col gap-y-2">
              <Shimmer className="h-4 w-1/3" />
              <Shimmer className="h-4 w-1/4" />
            </span>
          </span>
          <Shimmer className="h-4 w-full" />
          <Shimmer className="h-4 w-full" />
        </div>
        <Shimmer className="h-4 w-1/4" />
        <div className="flex gap-x-4 px-4">
          <div className="flex flex-1 flex-col items-center gap-y-2">
            <Shimmer className="h-14 w-14 rounded-full" />
            <Shimmer className="h-4 w-full" />
          </div>
          <div className="flex flex-1 flex-col items-center gap-y-2">
            <Shimmer className="h-14 w-14 rounded-full" />
            <Shimmer className="h-4 w-full" />
          </div>
          <div className="flex flex-1 flex-col items-center gap-y-2">
            <Shimmer className="h-14 w-14 rounded-full" />
            <Shimmer className="h-4 w-full" />
          </div>
          <div className="flex flex-1 flex-col items-center gap-y-2">
            <Shimmer className="h-14 w-14 rounded-full" />
            <Shimmer className="h-4 w-full" />
          </div>
        </div>
        <Shimmer className="h-4 w-1/4" />
        <div className=" relative h-48 w-full overflow-clip rounded-xl border border-tertiary-200">
          <div className="flex h-1/3 w-full flex-col justify-center gap-y-2 px-4 ">
            <Shimmer className="h-4 w-1/3" />
            <Shimmer className="h-4 w-1/2" />
          </div>
          <div className="flex h-2/3 w-full flex-col justify-center gap-y-2 border-t  border-tertiary-200 px-4 ">
            <Shimmer className="h-4 w-1/5" />
            <Shimmer className="h-4 w-1/2" />
            <Shimmer className="h-4 w-1/3" />
            <Shimmer className="h-4 w-1/2" />
          </div>
          <div className="absolute right-4 top-1/2 h-5/6 w-1/4 -translate-y-1/2">
            <Shimmer className="h-full w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}
