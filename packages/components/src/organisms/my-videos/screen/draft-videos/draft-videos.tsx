"use client";
import { VideosTableBase } from "../shared";
import { useColumns } from "./column";
import { DraftVideosTableSkeleton } from "./draft-videos-table-skeleton";

export default function DraftVideos() {
  return (
    <VideosTableBase
      status={3}
      useColumns={useColumns}
      SkeletonComponent={DraftVideosTableSkeleton}
      includeVideoStats={false}
      noDataTitle="No drafts yet"
      noDataDescription="Your drafts will appear here once you start creating."
    />
  );
}
