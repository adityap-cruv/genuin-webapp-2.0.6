import { Tabs, TabsContent, TabsList, TabsTrigger } from "@genuin/ui/tabs";
import { cn } from "@genuin/ui/utils";

type ProfileDetailsTabsPropsType = Omit<
  {
    userId: string;
  } & React.ComponentProps<typeof Tabs>,
  "defaultValue" | "defaultChecked" | "children"
>;

export function ProfileDetailsTabs({
  userId,
  className,
  ...restProps
}: ProfileDetailsTabsPropsType) {
  return (
    <Tabs
      defaultValue="communities"
      className={cn("gencl:w-full gencl:h-full", className)}
      {...restProps}
    >
      <TabsList>
        <TabsTrigger value="communities">Communities</TabsTrigger>
      </TabsList>
      <TabsContent value="communities">
        <CommunityList userId={userId} />
      </TabsContent>
    </Tabs>
  );
}

function CommunityList({ userId }: { userId: string }) {
  // Placeholder for community list component
  return <div>Community List for User ID: {userId}</div>;
}
