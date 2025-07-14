"use client";

import { TrendingGroups } from "@genuin/components/templates/trending-groups";
import { TrendingCommunities } from "@genuin/components/templates/trending-communities";

export function Explore() {
  return (
    <div className="gencl:p-6 gencl:flex gencl:flex-col gencl:gap-12 gencl:h-full gencl:overflow-auto">
      <TrendingGroups />
      <TrendingCommunities />
    </div>
  );
}
