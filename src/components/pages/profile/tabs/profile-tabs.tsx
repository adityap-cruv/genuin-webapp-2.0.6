import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'
import { TabIcons } from './tab-icons'
import { VideosTab } from './videos-tab'

export const ProfileTabs = {
  mobile: Mobile,
  desktop: Desktop,
}

// todo there is issue of scroll component we can not assign container as state variables work on solving that.
export function Desktop() {
  return (
    <Tabs defaultValue="all" className="h-body w-full">
      <TabsList className="sticky top-0 z-[2] md:top-[74px]">
        <TabsTrigger value="all">
          <TabIcons.all />
        </TabsTrigger>
        <TabsTrigger value="genuin">
          <TabIcons.genuin />
        </TabsTrigger>
        <TabsTrigger value="loop">
          <TabIcons.loop />
        </TabsTrigger>
      </TabsList>
      <TabsContent value="all">
        <VideosTab.all />
      </TabsContent>
      <TabsContent value="genuin">
        <VideosTab.genuin />
      </TabsContent>
      <TabsContent value="loop">
        <VideosTab.loop />
      </TabsContent>
    </Tabs>
  )
}

function Mobile() {
  return (
    <Tabs defaultValue="all" className="h-body w-full">
      <div>
        <TabsList className="sticky top-[74px] z-[2]">
          <TabsTrigger value="all">
            <TabIcons.all />
          </TabsTrigger>
          <TabsTrigger value="genuin">
            <TabIcons.genuin />
          </TabsTrigger>
          <TabsTrigger value="loop">
            <TabIcons.loop />
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <VideosTab.all />
        </TabsContent>
        <TabsContent value="genuin">
          <VideosTab.genuin />
        </TabsContent>
        <TabsContent value="loop">
          <VideosTab.loop />
        </TabsContent>
      </div>
    </Tabs>
  )
}
