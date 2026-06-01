"use client";

import { TrendingCommunities } from "@genuin/components/templates/trending-communities";
import { TrendingGroups } from "@genuin/components/templates/trending-groups";

export function Explore() {
  return (
    <div className="gencl:h-full gencl:overflow-auto">
      <div className="gencl:max-w-7xl gencl:mx-auto gencl:sm:p-6! gencl:p-4 gencl:space-y-6 gencl:sm:!space-y-12">
        <TrendingGroups />
        <TrendingCommunities />
      </div>
    </div>
  );
}
