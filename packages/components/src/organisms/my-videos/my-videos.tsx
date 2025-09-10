"use client";
import { useMemo, useState } from "react";

import {
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@genuin/ui/components";

import { PlusIcon } from "@genuin/ui/icons";
import MyVideosTable from "./screen/posted-videos/posted-videos";
import DraftVideos from "./screen/draft-videos";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { Link } from "@genuin/components/molecules/link";

export function MyVideos() {
  // Memoize tab configuration
  const tabs = useMemo(
    () =>
      [
        { value: "posted", label: "Posted" },
        { value: "drafts", label: "Drafts" },
      ] as const,
    []
  );

  const [activeTab, setActiveTab] = useState("posted");

  return (
    <div
      className="gencl:p-6 gencl:pt-4"
      style={{
        height: "calc(100% - 60px)",
      }}
    >
      <div className="gencl:flex gencl:items-center gencl:justify-between gencl:mb-6">
        <h2 className="gencl:text-headline-3-semi-bold">My Videos</h2>
        <div className="gencl:flex gencl:items-center gencl:space-x-2">
          <Link href={buildPageUrl({ type: "posts-create" })}>
            <Button theme="secondary" size="md">
              <PlusIcon className="gencl:size-6" />
              Create Post
            </Button>
          </Link>
        </div>
      </div>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="gencl:flex gencl:flex-col gencl:h-full"
      >
        {/* Fixed header with tabs - sticky positioning */}
        <div className="gencl:sticky gencl:top-0 gencl:z-10 gencl:bg-white ">
          <TabsList className="gencl:w-auto gencl:inline-flex gencl:bg-transparent gencl:border-none gencl:rounded-none gencl:h-10 gencl:p-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="gencl:relative gencl:data-[state=active]:gencl:bg-transparent gencl:data-[state=active]:gencl:text-primary gencl:data-[state=active]:gencl:border-b-2 gencl:data-[state=active]:gencl:border-primary gencl:rounded-none gencl:px-4 gencl:py-1 gencl:text-sm gencl:font-medium"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Scrollable content area */}
        <div className="gencl:flex-1 gencl:overflow-y-auto gencl:h-full">
          <TabsContent value="posted" className="gencl:h-full">
            <MyVideosTable />
          </TabsContent>
          <TabsContent value="drafts" className="gencl:h-full">
            <DraftVideos />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
