import React from "react";
import { Image } from "@genuin/ui/components/image";
import { ImageIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";
import { MediaModal } from "./link-thumbnail-modal";
import { useState } from "react";

type LinkThumbnailProps = {
  className?: string;
  width?: number;
  height?: number;
  scale?: 0 | 0.5 | 0.75 | 0.9 | 0.95 | 1 | 1.05 | 1.1 | 1.25 | 1.5;
  image?: string;
  title?: string;
  fileTypes?: string;
  fileDimension?: string;
  onImageChange?: (args: { file: File; url?: string }) => void;
  handelRemove?: () => void;
};

export function LinkThumbnail({
  className = "gencl:rounded-xl",
  width,
  height,
  scale,
  image,
  title,
  fileTypes,
  fileDimension,
  onImageChange,
  handelRemove,
}: LinkThumbnailProps) {
  return (
    <>
      <div
        className={cn(
          "gencl:relative gencl:overflow-hidden gencl:mb-2 gencl:border gencl:border-secondary-150 ",
          className
        )}
        style={{ width, height }}
      >
        {image ? (
          <Image
            alt={title}
            className="gencl:h-full gencl:w-full"
            scale={scale}
            src={image}
          />
        ) : (
          <MediaModal
            type="media-upload"
            title="Media Upload"
            uploadPath="uploads/linkouts"
            fileNamePrefix="linkouts"
            aspectRatio={1 / 1}
            roundCrop={false}
            onImageChange={({ file, url }) => {
              onImageChange?.({ file, url });
            }}
          >
            <div
              style={{ width, height }}
              className="gencl:flex-center gencl:hover:bg-secondary-50 gencl:cursor-pointer"
            >
              <ImageIcon />
            </div>
          </MediaModal>
        )}
        {image && (
          <div
            style={{ width, height }}
            className={cn(
              "gencl:absolute gencl:flex gencl:flex-col gencl:items-center gencl:justify-center gencl:gap-2 gencl:bg-black/50 gencl:top-0 gencl:left-0 gencl:w-full gencl:h-full gencl:hover:opacity-100 gencl:opacity-0"
            )}
          >
            <MediaModal
              type="media-upload"
              title="Media Upload"
              uploadPath="uploads/linkouts"
              fileNamePrefix="linkouts"
              aspectRatio={1 / 1}
              roundCrop={false}
              onImageChange={({ file }) => {
                onImageChange?.({ file });
              }}
            >
              <p className="gencl:text-white gencl:text-body-2-bold gencl:cursor-pointer">
                Edit
              </p>
            </MediaModal>
            <p
              className="gencl:text-white gencl:text-body-2-bold gencl:cursor-pointer"
              onClick={handelRemove}
            >
              Remove
            </p>

          </div>
        )}
      </div>
      <p className="gencl:text-body-2-medium gencl:text-secondary-600">
        File type: {fileTypes}
      </p>
      <p className="gencl:text-body-2-medium gencl:text-secondary-600">
        Image dimension: {fileDimension}
      </p>
    </>
  );
}
