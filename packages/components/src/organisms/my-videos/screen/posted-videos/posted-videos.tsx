"use client";
import { VideosTableBase } from "../shared";
import { useColumns } from "./column";
import { PostedVideosTableSkeleton } from "./posted-videos-table-skeleton";

export default function MyVideosTable() {
  return (
    <VideosTableBase
      status={1}
      useColumns={useColumns}
      SkeletonComponent={PostedVideosTableSkeleton}
      includeVideoStats={true}
      noDataTitle="No posts yet"
      noDataDescription="Start by creating a post for your audience"
    />
  );
}
