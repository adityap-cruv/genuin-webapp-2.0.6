import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'
import { TabIcons } from './tabIcons'
import { VideosTab } from './videosTab'

export function ProfileTabs() {
  return (
    <Tabs defaultValue="all">
      <TabsList>
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
