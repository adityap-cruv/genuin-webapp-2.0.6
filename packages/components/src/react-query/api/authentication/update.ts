import { getDeviceId } from "@genuin/components/lib/utils/device-id";
import { encryptText } from "@genuin/components/lib/utils/encryption";
import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import { API_PATHS } from "@genuin/components/react-query/paths";
import { useMutation } from "@tanstack/react-query";

type UpdateEmailOrPhoneProps = {
  code: string;
  /**
   * The auth session ID that was returned from the sendOtp API.
   */
  preAuthSessionId: string;
  /**
   * The device ID that was returned from the sendOtp API.
   */
  responseDeviceId: string;
};

/**
 * This apis is only for update email/phone flow.
 * @returns
 */
export async function updateEmailOrPhone({
  code,
  preAuthSessionId,
  responseDeviceId: resDeviceId,
}: UpdateEmailOrPhoneProps) {
  const deviceId = getDeviceId();
  return await axiosInstance
    .post(API_PATHS.AUTH_UPDATE_EMAIL_OF_PHONE, {
      userInputCode: code,
      deviceId: resDeviceId,
      encrypted_device_id: encryptText(deviceId, true),
      preAuthSessionId,
    })
    .then((res) => {
      return { verified: true };
    })
    .catch((_) => {
      throw new Error("Something went wrong while updating email or phone.");
    });
}

/**
 * Hook to update email or phone.
 * @returns A mutation function to update email or phone.
 */
export function useUpdateEmailOrPhoneMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: { verified: boolean }) => void;
  onError?: (error: unknown) => void;
} = {}) {
  return useMutation({
    mutationFn: updateEmailOrPhone,
    retry: false, // Disable retry for this mutation
    onSuccess,
    onError,
  });
}

/**
 * Type definition for the user object.
 */
type UserType = {
  name?: string | null;
  bio?: string | null;
  nickname: string;
  is_avatar: boolean;
  profile_image: string;
  birthday: string;
  linkedin_id?: string | null;
  insta_id?: string | null;
  twitter_id?: string | null;
  tiktok_id?: string | null;
  platform_guidelines: boolean;
  community_walkthrough: boolean;
  password: string;
};

export async function updateUser(
  user: Partial<UserType>
): Promise<{ status: boolean; user: any }> {
  return await axiosInstance
    .patch(API_PATHS.AUTH_UPDATE_USER, { user })
    .then((res) => {
      return { status: res.status === 200, user: res.data.data };
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log("::ERROR in update user profile::", e);
      throw new Error("Something went wrong");
    });
}

/**
 * Hook to update user profile.
 * @returns A mutation function to update user profile.
 */
export function useUpdateUserMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: Awaited<ReturnType<typeof updateUser>>) => void;
  onError?: (error: unknown) => void;
}) {
  return useMutation({
    mutationFn: updateUser,
    retry: false, // Disable retry for this mutation
    onSuccess,
    onError,
  });
}
