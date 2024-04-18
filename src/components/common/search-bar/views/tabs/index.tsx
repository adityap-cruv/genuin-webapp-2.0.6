import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { useSearchBarStore } from '../../store'
import { useQuery } from '@tanstack/react-query'
import { getTopResults } from '../../api'
import { Loader } from '@components/ui/loader'
import { Top } from './top'
import { People } from './people'
import { Communities } from './communities'
import { Posts } from './posts'
import { Loops } from './loops'

export type CommunityType = {
  id: string
  memberCount: number
  description?: string | null
  handle: string
  slug: string
  profileImage?: string | null
  name?: string | null
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

  return (
    <Tabs className="h-full w-full overflow-auto" defaultValue={defaultTab} value={defaultTab}>
      <TabsList className="sticky top-0 z-10 border-b border-b-monochrome-8 bg-monochrome-white [&_p]:text-body-1-bold">
        <TabsTrigger
          value="TOP"
          onClick={() => {
            setView('TABS', 'TOP')
          }}>
          <p className="text-body-1-bold">Top</p>
        </TabsTrigger>
        <TabsTrigger
          value="POSTS"
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
      <TabsContent value="TOP">
        {isLoading ? (
          <div className="flex h-full w-full items-center justify-center">
            <Loader size="md" className="fill-primary" />
          </div>
        ) : (
          <Top
            communities={data?.communities}
            loops={data?.loops ?? undefined}
            people={data?.people}
            ranking={data?.rankings}
            videos={data?.videos}
          />
        )}
      </TabsContent>
      <TabsContent value="POSTS">
        <div className="pt-4">
          <Posts videos={data?.videos} />
        </div>
      </TabsContent>
      <TabsContent value="COMMUNITIES">
        <Communities communities={data?.communities} />
      </TabsContent>
      <TabsContent value="LOOPS">
        <Loops loops={data?.loops ?? undefined} />
      </TabsContent>
      <TabsContent value="PEOPLE">
        <People people={data?.people} />
      </TabsContent>
    </Tabs>
  )
}
