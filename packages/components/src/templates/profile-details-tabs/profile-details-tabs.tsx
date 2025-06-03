import { Tabs, TabsContent, TabsList, TabsTrigger } from "@genuin/ui/tabs";
import { cn } from "@genuin/ui/utils";

import { CommunityList } from "./community-list";

type ProfileDetailsTabsPropsType = Omit<
  {
    userId: string;
    forBrand: boolean;
  } & React.ComponentProps<typeof Tabs>,
  "defaultValue" | "defaultChecked" | "children"
>;

export function ProfileDetailsTabs({
  userId,
  forBrand,
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
        <CommunityList userId={userId} forBrand={forBrand} />
      </TabsContent>
    </Tabs>
  );
}
