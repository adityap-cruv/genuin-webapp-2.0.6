import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'
import { TabIcons } from './tab-icons'
import { VideosTab } from './videos-tab'

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
