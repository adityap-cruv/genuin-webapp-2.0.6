import { Tabs, TabsContent, TabsList, TabsTrigger } from "@genuin/ui/tabs";

export function GroupDetailsTabs({ slug }: { slug: string }) {
  return (
    <Tabs defaultValue="posts">
      <TabsList>
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="members">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="posts">Group details content</TabsContent>
      <TabsContent value="members">Group members content</TabsContent>
    </Tabs>
  );
}
