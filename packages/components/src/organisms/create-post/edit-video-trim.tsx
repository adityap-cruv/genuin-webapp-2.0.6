"use client";

import { Toast } from "@genuin/ui/components/toaster";
import { forwardRef, useCallback, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";

import { trimVideo } from "@genuin/components/lib/utils/video-processor";
import { VideoTrimSlider } from "@genuin/components/molecules/video-trim-slider";
import { loadVideoMetadata, urlToFile } from "@genuin/components/molecules/video-trim-slider/utils";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { usePostCreateUploadUrlMutation } from "@genuin/components/react-query/api/posts/post-video-upload";

import { PostPlayer } from "../post-player";

import { SectionLayout, SectionLayoutLeft, SectionLayoutRight } from "./section-layout";
import type { EditTrimVideoProps, TrimHandler, UpdatePostDataProps } from "./types";

type VideoFileDataState = {
  videoDuration: number;
  file: File | null;
  aspectRatio: string;
  resolution: string;
  size: number;
};

const UPLOAD_VIDEO_PATH = "temp_video";

function ComingSoonPlaceholder() {
  return (
    <div className="gencl:w-full gencl:h-full gencl:overflow-auto">
      <div className="gencl:w-full gencl:h-full gencl:flex gencl:flex-col gencl:gap-2">
        <div className="gencl:flex gencl:items-center gencl:gap-2">
          <span className="gencl:text-body-0-semi-bold">Edit Clip</span>
          <div className="gencl:px-2 gencl:py-1 gencl:text-body-2-bold gencl:text-secondary-600 gencl:bg-secondary-50 gencl:w-fit gencl:rounded-full">
            Coming Soon
          </div>
        </div>

        {/* Coming Soon Screen */}
        <div className="gencl:flex gencl:flex-col gencl:items-center gencl:justify-center gencl:gap-1 gencl:w-full gencl:h-full gencl:bg-secondary-50 gencl:rounded-lg">
          <p className="gencl:text-body-0-semi-bold gencl:text-secondary-900">Clip Editing Coming Soon!</p>
          <p className="gencl:text-body-2-medium gencl:text-secondary-600">
            You&apos;ll soon be able to replace, add, and reorder clips in your video.
          </p>
        </div>
      </div>
    </div>
  );
}

export const EditVideoTrim = forwardRef<TrimHandler, EditTrimVideoProps>(
  (
    {
      postData,
      showTrimVideoBtn,
      showEditCoverBtn,
      onTrimmerReady,
      playerOverlayAction,
      updatePostData,
      setVideoTrimProcessing,
    },
    ref
  ) => {
    const trimRangeRef = useRef<{ start: number; end: number }>({
      start: 0,
      end: 0,
    });
    const postPlayerRef = useRef<HTMLDivElement | null>(null);
    const [containerHeight, setContainerHeight] = useState(0);

    const [videoFileData, setVideoFileData] = useState<VideoFileDataState | null>(null);

    const { mutate: generateUploadVideoUrl } = usePostCreateUploadUrlMutation({
      onSuccess: (res) => {
        if (!videoFileData) return;
        const { videoDuration, file, aspectRatio, resolution, size } = videoFileData;

        const basePayload = {
          duration: videoDuration?.toString(),
          size: size?.toString(),
          video_name: `${UPLOAD_VIDEO_PATH}/${file?.name}`,
          aspect_ratio: aspectRatio.toString(),
          resolution: resolution,
          meta_data: {
            contains_external_videos: false,
            media_type: "video",
          },
        };

        updatePostData(basePayload as UpdatePostDataProps);
        setVideoTrimProcessing(false);
      },
      onError: () => {
        Toast.Error({
          message: "Failed to upload video details. Please try again later.",
        });
        setVideoTrimProcessing(false);
      },
    });

    const handleTrim = useCallback(async () => {
      let inputFile: string | File = postData?.video?.source;

      try {
        setVideoTrimProcessing(true);

        // If inputFile is a URL, convert it to a File object
        if (typeof inputFile === "string") {
          inputFile = await urlToFile(inputFile);
        }

        if (!inputFile) {
          console.error("No valid input file found");
          setVideoTrimProcessing(false);
          return;
        }

        const newBlobFile = await trimVideo({
          file: inputFile,
          startTime: trimRangeRef?.current?.start,
          endTime: trimRangeRef?.current?.end,
        });

        if (!newBlobFile) {
          console.error("Video trim failed!");
          setVideoTrimProcessing(false);
          return;
        }

        const newFileName = `${uuid()}.webm`;
        const renamedFile = new File([newBlobFile], newFileName, {
          type: "video/webm",
        });

        // downloadBlob(newBlobFile, inputFile.name || "trimmed_video.mp4");

        const videoMetadata = await loadVideoMetadata(newBlobFile);

        setVideoFileData({
          file: renamedFile,
          videoDuration: videoMetadata.duration,
          aspectRatio: videoMetadata?.aspectRatio ?? "",
          resolution: videoMetadata.resolution,
          size: videoMetadata.size ?? 0,
        });

        // upload post video
        if (renamedFile) {
          generateUploadVideoUrl({ file: renamedFile, kind: "video" });
        }

        // console.log("Trimmed video download successfully!");
      } catch (error) {
        console.error("Video trimming error:", error);
        setVideoTrimProcessing(false);
      }
    }, [trimRangeRef]);

    // Expose handleTrim to parent via ref
    useImperativeHandle(ref, () => ({ handleTrim }));

    useLayoutEffect(() => {
      if (postPlayerRef.current) {
        const height = postPlayerRef.current.clientHeight;
        setContainerHeight(height - 108);
      } else {
        setContainerHeight(450);
      }
    }, []);

    return (
      <SectionLayout ref={postPlayerRef}>
        <SectionLayoutLeft className="gencl:justify-start gencl:items-center">
          <div className="gencl:ps-3">
            <PostPlayer
              editClipVideo={() => playerOverlayAction("clip")}
              editCoverImage={(url) => playerOverlayAction("cover", url)}
              post={postData as unknown as PostDetailsType}
              className="gencl:mb-2"
              showClipVideoBtn={showTrimVideoBtn}
              showEditCoverBtn={showEditCoverBtn}
              style={{ height: containerHeight }}
            />
          </div>
          <div className="gencl:w-full gencl:h-21 gencl:ps-3">
            <VideoTrimSlider
              ref={trimRangeRef}
              videoUrl={postData?.video?.source ?? ""}
              onTrimmerReady={onTrimmerReady}
            />
          </div>
        </SectionLayoutLeft>
        <SectionLayoutRight>
          <ComingSoonPlaceholder />
        </SectionLayoutRight>
      </SectionLayout>
    );
  }
);

EditVideoTrim.displayName = "EditVideoTrim";
