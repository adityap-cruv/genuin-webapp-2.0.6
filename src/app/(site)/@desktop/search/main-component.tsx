import { Input } from '@components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'

export function MainComponent() {
  return (
    <>
      <div className="h-full w-full overflow-auto p-4">
        <div className='mx-3 w-1/3 relative'>
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
          <p className="text-title-md">Top</p>
        </TabsTrigger>
        <TabsTrigger value="Videos">
          <p className="text-title-md">Videos</p>
        </TabsTrigger>
        <TabsTrigger value="Communities">
          <p className="text-title-md">Communities</p>
        </TabsTrigger>
        <TabsTrigger value="Loops">
          <p className="text-title-md">Loops</p>
        </TabsTrigger>
        <TabsTrigger value="People">
          <p className="text-title-md">People</p>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="Top" className="mx-4">
        Top
      </TabsContent>
      <TabsContent value="Videos" className="mx-4">
        <VideosTab />
      </TabsContent>
      <TabsContent value="Communities" className="mx-4">
        Communities
      </TabsContent>
      <TabsContent value="Loops" className="mx-4">
        Loops
      </TabsContent>
      <TabsContent value="People" className="mx-4">
        People
      </TabsContent>
    </Tabs>
  )
}

function VideosTab() {
  const itemList = ['item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item6']

  return (
    <>
      <div className="my-2 grid w-full grid-cols-5 gap-2">
        {itemList.map((item, index) => (
          <div key={index} className="relative flex items-center">
            <div className="aspect-reel w-full rounded bg-blue-10"></div>
          </div>
        ))}
      </div>
    </>
  )
}
