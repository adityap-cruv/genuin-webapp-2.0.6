import type { ComponentProps } from "react";
import type { FileUploader } from "react-drag-drop-files";

export type SupportedFileType =
  // 📷 Image types
  | "JPG"
  | "JPEG"
  | "PNG"
  | "GIF"
  | "WEBP"
  | "SVG"

  // 🎥 Video types
  | "MP4"
  | "MOV"
  | "AVI"
  | "MKV"
  | "WEBM"
  | "WMV"

  // 📄 Document and text file types
  | "PDF"
  | "DOC"
  | "DOCX"
  | "XLS"
  | "XLSX"
  | "PPT"
  | "PPTX"
  | "TXT"
  | "CSV"

  // 📦 Archive types
  | "ZIP"
  | "RAR"
  | "7Z"
  | "TAR"

  // 🎵 Audio types
  | "MP3"
  | "WAV"
  | "OGG"

  // 💻 Code file types
  | "HTML"
  | "CSS"
  | "JS"
  | "TS"
  | "JSON"
  | "PY";

export interface FileUploaderValidation {
  video: {
    aspectRatio?: "9:16";
    minDuration?: number;
    maxDuration?: number;
  };
}

export type FileSelectDropzoneProps = {
  onError?: (error: string) => void;
  onFileChange?: (file: File) => void;
  fileUploadProps?: ComponentProps<typeof FileUploader>;
  containerProps?: React.HTMLAttributes<HTMLDivElement>;
  disabled?: boolean;
  isLoading?: boolean;
  showErrorMessage?: boolean;
  config: {
    allowedFileTypes?: SupportedFileType[];
    multiple?: boolean;
    minFileSize?: number;
    maxFileSize?: number;
    messages?: {
      uploadInfo?: string;
      uploadFailed?: string;
    };
    validation: FileUploaderValidation;
  };
};
