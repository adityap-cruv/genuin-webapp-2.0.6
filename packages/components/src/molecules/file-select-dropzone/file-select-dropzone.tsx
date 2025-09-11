import React, { useState, useCallback } from "react";
import { FileUploader } from "react-drag-drop-files";
import { v4 as uuid } from "uuid";
import { cn } from "@genuin/ui/lib/utils";
import { UploadIcon } from "@genuin/ui/icons";
import { Loader } from "@genuin/ui/components/loader";
import { FileSelectDropzoneProps } from "./file-select-dropzone.types";
import { allowedFileFormats, fileUploaderConfig } from "./utils";
import {
  validateVideoAspectRatio,
  validateVideoDuration,
} from "@genuin/components/lib/utils/video";

const FileSelectDropzone: React.FC<FileSelectDropzoneProps> = ({
  onError,
  onFileChange,
  disabled = false,
  isLoading = false,
  showErrorMessage = true,
  fileUploadProps,
  containerProps = {},
  config = fileUploaderConfig,
}) => {
  const { className, ...restContainerProps } = containerProps;
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const isValidFilename = (filename: string): boolean => {
    // Check for null bytes (%00, \0)
    if (filename.includes("\0") || filename.includes("%00")) {
      return false;
    }

    // Check for empty filename
    if (!filename || filename.trim() === "") {
      return false;
    }

    // Make sure the extension matches allowed formats without any manipulation
    const fileExt = filename.split(".").pop()?.toLowerCase();
    const filterAllowedFilesFormats = allowedFileFormats.filter(({ type }) =>
      config?.allowedFileTypes?.includes(type)
    );
    const allowedExts = filterAllowedFilesFormats.map((type) =>
      type?.extension?.replace(".", "").toLowerCase()
    );

    if (!fileExt || !allowedExts.includes(fileExt)) {
      return false;
    }

    // Check for suspicious patterns like double extensions (e.g. file.php.mp4)
    const nameParts = filename.split(".");
    if (nameParts.length > 2) {
      const suspiciousExts = [
        "php",
        "exe",
        "js",
        "html",
        "htm",
        "asp",
        "jsp",
        "sh",
        "bat",
      ];
      for (let i = 0; i < nameParts.length - 1; i += 1) {
        if (suspiciousExts.includes(nameParts[i]?.toLowerCase())) {
          return false;
        }
      }
    }

    return true;
  };

  const handleFileChange = useCallback(
    async (file: File) => {
      if (!file) {
        const error = "No file selected";
        setFileError(error);
        onError?.(error);
        return;
      }

      if (!isValidFilename(file.name)) {
        const errorMessage = "Invalid filename";
        setFileError(errorMessage);
        onError?.(errorMessage);
        return;
      }

      const isVideoFileType = config?.allowedFileTypes?.some(
        (type) => ["MP4", "WEBM"].includes(type)
        // ["MP4", "MOV", "AVI", "MKV", "WEBM", "WMV"].includes(type)
      );

      if (isVideoFileType && config?.validation?.video) {
        const isValidRatio = await validateVideoAspectRatio(
          file,
          config?.validation?.video?.aspectRatio
        );
        if (!isValidRatio) {
          const errorMessage = `Please upload a video with a ${config?.validation?.video?.aspectRatio} aspect ratio. Other formats are not supported.`;
          setFileError(errorMessage);
          onError?.(errorMessage);
          return;
        }

        const isValidDuration = await validateVideoDuration(
          file,
          config?.validation?.video?.minDuration,
          config?.validation?.video?.maxDuration
        );
        if (!isValidDuration) {
          const errorMessage = `Video must be between ${config?.validation?.video?.minDuration} and ${config?.validation?.video?.maxDuration} seconds long. Please adjust the duration and try again.`;
          setFileError(errorMessage);
          onError?.(errorMessage);
          return;
        }
      }

      // Update file name
      const fileExtension = file.name.split(".").pop();
      const updatedFile = new File([file], `${uuid()}.${fileExtension}`, {
        type: file.type,
      });
      setFileError(null);
      onFileChange?.(updatedFile);
      setIsDragging(false);
    },
    [onFileChange, onError]
  );

  const handleError = useCallback(
    (error: string) => {
      setFileError(error);
      onError?.(error);
    },
    [onError]
  );

  const renderLoading = (
    <>
      <Loader size="md" />
      <p className="gencl:text-body-2-medium gencl:text-secondary-600">
        Uploading...
      </p>
    </>
  );

  const renderUploadInstructions = (
    <>
      <UploadIcon
        className={cn({
          "gencl:fill-primary": isDragging,
          "gencl:fill-secondary-600": !isDragging,
        })}
        variant="light"
      />
      <div>
        <p className="gencl:text-body-1-semi-bold gencl:mb-2">
          Drag your file(s) or{" "}
          <span className="gencl:text-primary">browse</span>
        </p>
        <p
          className={cn("gencl:text-body-2-medium! gencl:text-secondary-600", {
            "gencl:text-error-status": fileError,
          })}
        >
          {fileError
            ? config?.messages?.uploadFailed
            : config?.messages?.uploadInfo}
        </p>
      </div>
    </>
  );

  return (
    <div>
      <div
        className={cn(
          "gencl:w-full gencl:text-center gencl:rounded-md gencl:border gencl:border-dashed",
          "gencl:flex gencl:items-center gencl:justify-center gencl:z-10",
          {
            "gencl:border-primary": isDragging || isLoading,
            "gencl:border-secondary-300": !isDragging && !isLoading,
            "gencl:opacity-50": disabled,
            "gencl:border-error-status": fileError,
          },
          className
        )}
        {...restContainerProps}
      >
        <FileUploader
          onDraggingStateChange={setIsDragging}
          multiple={config?.multiple}
          handleChange={handleFileChange}
          types={config?.allowedFileTypes}
          maxSize={config?.maxFileSize}
          minSize={config?.minFileSize}
          onTypeError={handleError}
          onSizeError={handleError}
          disabled={isLoading || disabled}
          hoverTitle=" "
          classes={`drop_area drop_zone custom_style ${isDragging ? "drag-active" : ""}`}
          {...fileUploadProps}
        >
          <div className="gencl:flex gencl:flex-col gencl:items-center gencl:justify-center gencl:p-6 gencl:gap-3">
            {isLoading ? renderLoading : renderUploadInstructions}
          </div>
        </FileUploader>
      </div>

      {fileError && showErrorMessage && (
        <p className="gencl:text-body-2-medium gencl:text-red">{fileError}</p>
      )}
    </div>
  );
};

export default FileSelectDropzone;
