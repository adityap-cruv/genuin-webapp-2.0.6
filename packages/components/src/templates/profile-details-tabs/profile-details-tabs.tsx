"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@genuin/ui/tabs";
import { cn } from "@genuin/ui/utils";

import { CommunityList } from "./community-list";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { useCallback, useEffect, useState } from "react";

type ProfileDetailsTabsPropsType = Omit<
  {
    userId: string;
    forBrand: boolean;
    aboutComponent: React.ReactNode;
  } & React.ComponentProps<typeof Tabs>,
  "defaultValue" | "defaultChecked" | "children"
>;

export function ProfileDetailsTabs({
  userId,
  forBrand,
  aboutComponent,
  className,
  ...restProps
}: ProfileDetailsTabsPropsType) {
  const { isDesktop } = useDeviceDetectMediaQuery();
  const [value, setValue] = useState("communities");
  const contentClassName = "gencl:p-4 gencl:sm:p-0! gencl:sm:pt-6!";

  const handleValueChange = useCallback((newValue: string) => {
    setValue(newValue);
  }, []);

  useEffect(() => {
    if (isDesktop && value === "about") {
      setValue("communities");
    }
  }, [isDesktop]);

  return (
    <Tabs
      value={value}
      onValueChange={handleValueChange}
      className={cn("gencl:w-full gencl:h-full", className)}
      {...restProps}
    >
      <TabsList>
        <TabsTrigger value="communities">Communities</TabsTrigger>
        {!isDesktop && <TabsTrigger value="about">About</TabsTrigger>}
      </TabsList>
      <TabsContent value="communities" className={contentClassName}>
        <CommunityList userId={userId} forBrand={forBrand} />
      </TabsContent>
      {!isDesktop && (
        <TabsContent value="about" className={contentClassName}>
          {aboutComponent}
        </TabsContent>
      )}
    </Tabs>
  );
}
