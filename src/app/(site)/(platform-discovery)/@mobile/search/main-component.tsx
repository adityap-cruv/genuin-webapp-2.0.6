import { Input } from '@components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'

export function MainComponent() {
  return (
    <>
      <div className="h-full w-full overflow-auto p-4">
        <div className="relative w-full">
          <Input className="rounded-full border-0 bg-monochrome-9" />
        </div>
        <SearchTabs />
      </div>
    </>
  )
}

function SearchTabs() {
  return (
    <Tabs defaultValue="Top">
      <TabsList className="flex max-w-min">
        <TabsTrigger value="Top">
          <p className="text-title-3-bold">Top</p>
        </TabsTrigger>
        <TabsTrigger value="Videos">
          <p className="text-title-3-bold">Videos</p>
        </TabsTrigger>
        <TabsTrigger value="Communities">
          <p className="text-title-3-bold">Communities</p>
        </TabsTrigger>
        <TabsTrigger value="Loops">
          <p className="text-title-3-bold">Loops</p>
        </TabsTrigger>
        <TabsTrigger value="People">
          <p className="text-title-3-bold">People</p>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="Top">Top</TabsContent>
      <TabsContent value="Videos">
        <VideosTab />
      </TabsContent>
      <TabsContent value="Communities">Communities</TabsContent>
      <TabsContent value="Loops">Loops</TabsContent>
      <TabsContent value="People">People</TabsContent>
    </Tabs>
  )
}

function VideosTab() {
  const itemList = ['item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item6']

  return (
    <>
      <div className="my-2 grid w-full grid-cols-2 gap-2">
        {itemList.map((item, index) => (
          <div key={index} className="relative flex items-center">
            <div className="aspect-reel w-full rounded bg-blue-10"></div>
          </div>
        ))}
      </div>
    </>
  )
}
