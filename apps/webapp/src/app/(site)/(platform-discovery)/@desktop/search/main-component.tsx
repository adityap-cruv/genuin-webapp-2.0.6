import { CustomAvatar } from '@components/custom/custom-avatar'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'
import { abbreviateNumber } from '@lib/utils'

export function MainComponent() {
  return (
    <>
      <div className="h-full w-full overflow-auto p-4">
        <div className="relative mx-3 w-1/3">
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
          <p className="text-title-3-bold">Groups</p>
        </TabsTrigger>
        <TabsTrigger value="People">
          <p className="text-title-3-bold">People</p>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="Top" className="mx-4">
        Top
      </TabsContent>
      <TabsContent value="Videos" className="mx-4">
        <VideosTab />
      </TabsContent>
      <TabsContent value="Communities" className="mx-4">
        <Communities />
      </TabsContent>
      <TabsContent value="Loops" className="mx-4">
        Groups
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

function Communities() {
  const communityData = [
    {
      name: 'DesiThinkTank',
      imageUrl: 'image1',
      members: 1000,
      description:
        'Where Brain Cells Curry Ideas. Spices of intellect simmer, as we whip up a storm of witty discussions, seasoning serious topics with a dash of humor',
    },
    {
      name: 'AnotherCommunity',
      imageUrl: 'image2',
      members: 500,
      description: 'Another community description goes here',
    },
  ]

  return (
    <>
      <div className="my-2 grid w-full grid-cols-2 gap-2">
        {communityData.map((community, index) => (
          <div key={index} className="rounded-xl border-solid p-4" style={{ border: '1px solid #DBDBDB' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-1 rounded-sm p-1 hover:bg-monochrome-9">
                <CustomAvatar
                  className="h-12 w-12 bg-red-40"
                  fallbackString={community.name}
                  imageUrl={community.imageUrl}
                  isAvatar={false}
                />
                <div className="mx-2">
                  <p className="line-clamp-1 text-body-1-bold">{community.name}</p>
                  <p className="line-clamp-1 text-body-1-demi text-monochrome">
                    {abbreviateNumber(community.members)} members
                  </p>
                </div>
              </div>
              <div>
                <Button variant="default" size="sm" className="px-4">
                  <p className="text-body-1-demi text-monochrome-white">Join</p>
                </Button>
              </div>
            </div>
            <p className="line-clamp-2 pt-2 text-body-1-demi">{community.description}</p>
          </div>
        ))}
      </div>
    </>
  )
}
