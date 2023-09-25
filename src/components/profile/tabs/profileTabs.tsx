import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs'
import { TabIcons } from './tabIcons'
import { VideosTab } from './videosTab'

export function ProfileTabs() {
  return (
    <div className="w-full md:pl-7">
      <Tabs defaultValue="all">
        <TabsList className="flex w-full">
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
    </div>
  )
}
