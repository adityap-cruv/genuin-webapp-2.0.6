import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { useSearchBarStore } from '../../store'
import { useQuery } from '@tanstack/react-query'
import { getTopResults } from '../../api'
import { Loader } from '@components/ui/loader'

export default function Component() {
  const { data, isLoading } = useQuery({
    queryFn: async () => await getTopResults('genuin'),
    queryKey: ['top', 'search', 'genuin'],
  })

  console.log('data::', data)
  const { defaultTab } = useSearchBarStore()

  if (isLoading)
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader size="md" />
      </div>
    )

  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList className="border-b border-b-monochrome-8 [&_p]:text-body-1-bold">
        <TabsTrigger value="TOP">
          <p className="text-body-1-bold">Top</p>
        </TabsTrigger>
        <TabsTrigger value="POSTS">
          <p className="text-body-1-bold">Posts</p>
        </TabsTrigger>
        <TabsTrigger value="COMMUNITIES">
          <p className="text-body-1-bold">Communities</p>
        </TabsTrigger>
        <TabsTrigger value="LOOPS">
          <p className="text-body-1-bold">Loops</p>
        </TabsTrigger>
        <TabsTrigger value="PEOPLE">
          <p className="text-body-1-bold">People</p>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="TOP">
        <div>top</div>
      </TabsContent>
      <TabsContent value="VIDEOS">
        <div>videos</div>
      </TabsContent>
      <TabsContent value="COMMUNITIES">
        <div>communities</div>
      </TabsContent>
      <TabsContent value="LOOPS">
        <div>loops</div>
      </TabsContent>
      <TabsContent value="PEOPLE">
        <div>people</div>
      </TabsContent>
    </Tabs>
  )
}
