import axios from "axios";
import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import { API_PATHS } from "@genuin/components/react-query/paths";
import { MEDIA_BASE_URL } from "@genuin/components/lib/utils/env";
import { useMutation } from "@tanstack/react-query";

export async function fetchImageBlob(url: string): Promise<string> {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}${API_PATHS.FETCH_IMAGE}?url=${encodeURIComponent(url)}`;
    const res = await fetch(apiUrl);

    if (!res.ok) {
      throw new Error(`Failed to fetch image. Status: ${res.status}`);
    }

    const blob = await res.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        if (typeof base64data === "string") {
          resolve(base64data);
        } else {
          reject(new Error("Failed to convert blob to base64 string"));
        }
      };
      reader.onerror = () => reject(new Error("FileReader error"));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("fetchImageBlob error:", error);
    throw error;
  }
}

export async function uploadProfileImage(file: File) {
  try {
    const getUrlResponse = await axiosInstance.post(API_PATHS.UPLOAD_URL, {
      contentType: file.type,
      path: `uploads/profile_images/${file.name}`,
    });
    const uploadUrl = getUrlResponse.data.data.uploadURL;
    const uploadResponse = await axios.put(uploadUrl, file, {
      headers: { "Content-Type": file.type },
    });
    if (uploadResponse.status === 200) {
      const imageUrl = `${MEDIA_BASE_URL}/uploads/profile_images/${file.name}`;
      return imageUrl;
    }
    return null;
  } catch (e) {
    console.log("::ERROR IN UPLOAD API::", e);
    return null;
  }
}
