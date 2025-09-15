import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import { API_PATHS } from "@genuin/components/react-query/paths";
import { MEDIA_BASE_URL } from "@genuin/components/lib/utils/env";
import axios from "axios";

type UploadKind = "video" | "image";

type UploadPayload = {
  file: File;
  kind: UploadKind;
};

type UploadResponse = {
  url: string;
  code: number;
  message: string;
};

export async function createUploadUrlPost({
  file,
  kind,
}: UploadPayload): Promise<UploadResponse | null> {
  try {
    const folder = kind === "video" ? "temp_video" : "uploads/thumbnails";
    const path = `${folder}/${file.name}`;

    const getUrlResponse = await axiosInstance.post(API_PATHS.UPLOAD_URL, {
      contentType: file.type,
      path,
    });

    const uploadUrl = getUrlResponse.data.data.uploadURL;

    const uploadResponse = await axios.put(uploadUrl, file, {
      headers: { "Content-Type": file.type },
    });

    if (uploadResponse.status === 200) {
      const imageUrl = `${MEDIA_BASE_URL}/${path}`;
      return {
        url: imageUrl,
        code: 200,
        message: "File uploaded successfully",
      };
    }

    return null;
  } catch (e) {
    console.error("::ERROR IN UPLOAD API::", e);
    return null;
  }
}

/**
 * Custom hook to use the create upload url posts mutation.
 */
export function usePostCreateUploadUrlMutation({
  onSuccess,
  onError,
  onMutate,
}: {
  onSuccess?: (data: Awaited<ReturnType<typeof createUploadUrlPost>>) => void;
  onError?: (error: Error) => void;
  onMutate?: () => void;
}) {
  return useMutation({
    mutationFn: createUploadUrlPost,
    onError,
    onSuccess,
    onMutate,
  });
}
