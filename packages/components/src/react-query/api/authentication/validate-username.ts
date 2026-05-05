import { useMutation } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";

import { useAxiosInstance } from "@genuin/components/context/axios";
import { API_PATHS } from "@genuin/components/react-query/paths";

export async function validateUsername(nickname: string, axiosInstance: AxiosInstance) {
  return await axiosInstance
    .post(API_PATHS.AUTH_VALIDATE_USERNAME, { nickname })
    .then((res) => {
      if (res.data.code === 200) return true;
      // else if (res.data.code === "5073") return false;
      throw new Error(res.data.message || "Username validation failed");
    })
    .catch((e) => {
      throw new Error("Error validating username: " + e.message);
    });
}

/**
 * Custom hook to validate a username using the validateUsername API.
 * Returns a TanStack Query mutation object.
 */
export function useValidateUsername({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: boolean) => void;
  onError?: (error: Error) => void;
}) {
  const axiosInstance = useAxiosInstance();

  return useMutation({
    mutationFn: (nickname: string) => validateUsername(nickname, axiosInstance),
    onSuccess,
    onError,
  });
}
