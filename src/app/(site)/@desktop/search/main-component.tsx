import { Input } from '@components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'

export function MainComponent() {
  return (
    <>
      Search
      {/* <Input placeholder="Email" /> */}
      <div className="h-full w-full overflow-auto p-4">
        <SearchTabs />
      </div>
    </>
  )
}

function SearchTabs() {
  return (
    <Tabs defaultValue="Loops">
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
  return <>Videos</>
}
