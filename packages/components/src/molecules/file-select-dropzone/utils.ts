import type { FileSelectDropzoneProps, SupportedFileType } from "./file-select-dropzone.types";

export const allowedFileFormats = [
  // 📷 Image types
  { extension: ".jpg", mimeType: "image/jpeg", type: "JPG" },
  { extension: ".jpeg", mimeType: "image/jpeg", type: "JPEG" },
  { extension: ".png", mimeType: "image/png", type: "PNG" },
  { extension: ".gif", mimeType: "image/gif", type: "GIF" },
  { extension: ".webp", mimeType: "image/webp", type: "WEBP" },
  { extension: ".svg", mimeType: "image/svg+xml", type: "SVG" },

  // 🎥 Video types
  { extension: ".mp4", mimeType: "video/mp4", type: "MP4" },
  { extension: ".mov", mimeType: "video/quicktime", type: "MOV" },
  { extension: ".avi", mimeType: "video/x-msvideo", type: "AVI" },
  { extension: ".mkv", mimeType: "video/x-matroska", type: "MKV" },
  { extension: ".webm", mimeType: "video/webm", type: "WEBM" },
  { extension: ".wmv", mimeType: "video/x-ms-wmv", type: "WMV" },

  // 📄 Document and text file types
  { extension: ".pdf", mimeType: "application/pdf", type: "PDF" },
  { extension: ".doc", mimeType: "application/msword", type: "DOC" },
  {
    extension: ".docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    type: "DOCX",
  },
  { extension: ".xls", mimeType: "application/vnd.ms-excel", type: "XLS" },
  {
    extension: ".xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    type: "XLSX",
  },
  { extension: ".ppt", mimeType: "application/vnd.ms-powerpoint", type: "PPT" },
  {
    extension: ".pptx",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    type: "PPTX",
  },
  { extension: ".txt", mimeType: "text/plain", type: "TXT" },
  { extension: ".csv", mimeType: "text/csv", type: "CSV" },

  // 📦 Archive types
  { extension: ".zip", mimeType: "application/zip", type: "ZIP" },
  { extension: ".rar", mimeType: "application/vnd.rar", type: "RAR" },
  { extension: ".7z", mimeType: "application/x-7z-compressed", type: "7Z" },
  { extension: ".tar", mimeType: "application/x-tar", type: "TAR" },

  // 🎵 Audio types
  { extension: ".mp3", mimeType: "audio/mpeg", type: "MP3" },
  { extension: ".wav", mimeType: "audio/wav", type: "WAV" },
  { extension: ".ogg", mimeType: "audio/ogg", type: "OGG" },

  // 💻 Code file types
  { extension: ".html", mimeType: "text/html", type: "HTML" },
  { extension: ".css", mimeType: "text/css", type: "CSS" },
  { extension: ".js", mimeType: "application/javascript", type: "JS" },
  { extension: ".ts", mimeType: "application/typescript", type: "TS" },
  { extension: ".json", mimeType: "application/json", type: "JSON" },
  { extension: ".py", mimeType: "text/x-python", type: "PY" },
] satisfies { extension: string; mimeType: string; type: SupportedFileType }[];

export const fileUploaderConfig: FileSelectDropzoneProps["config"] = {
  allowedFileTypes: ["JPG", "JPEG", "PNG", "GIF", "WEBP", "SVG"],
  minFileSize: 0,
  maxFileSize: 1,
  multiple: false,
  messages: {
    uploadFailed: "",
    uploadInfo: "",
  },
  validation: { video: {} },
};
