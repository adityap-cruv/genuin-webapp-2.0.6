import { getDeviceId } from "@genuin/components/lib/utils/device-id";
import { encryptText } from "@genuin/components/lib/utils/encryption";
import { axiosInstance } from "@react-query/axios-instance";
import { LOGIN_SOURCE } from "./constants";
import { parseUserData } from "./parser";
import { API_PATHS } from "@react-query/paths";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

type ConsumeOtpProps = Partial<{ email: string; phoneNumber: string }> & {
  code: string;
  /**
   * The pre-authentication session ID that was returned from the sendOtp API.
   */
  preAuthSessionId: string;
  /**
   * The device ID that was returned from the sendOtp API.
   */
  responseDeviceId: string;
};

/**
 * This api is only for login/signup flow.
 * @returns
 */
export async function consumeOtp({
  email,
  phoneNumber,
  code,
  preAuthSessionId,
  responseDeviceId: resDeviceId,
}: ConsumeOtpProps) {
  const deviceId = getDeviceId();
  return await axiosInstance
    .post(API_PATHS.AUTH_CONSUME_OTP, {
      userInputCode: code,
      phoneNumber: phoneNumber ? encryptText(phoneNumber, false) : undefined,
      email: email ? encryptText(email, false) : undefined,
      login_source: LOGIN_SOURCE.web,
      // login source is web according to backend.
      device_type: 3,
      encrypted_device_id: deviceId ? encryptText(deviceId, true) : undefined,
      preAuthSessionId,
      deviceId: resDeviceId,
    })
    .then((res) => {
      const accessToken = res.headers["gn-access-token"];
      const refreshToken = res.headers["gn-refresh-token"];
      const data = res.data.data;
      let user;
      if (data) {
        user = parseUserData(data, accessToken, refreshToken);
      }
      return { otpVerified: true, user };
    })
    .catch((e) => {
      // console.log('e::', e)
      return { otpVerified: false, user: null };
    });
}

type ConsumeOtpResponse = Awaited<ReturnType<typeof consumeOtp>>;

type UseConsumeOtpMutationOptions = {
  onSuccess?: (
    data: ConsumeOtpResponse,
    variables: ConsumeOtpProps,
    context: unknown
  ) => void;
  onError?: (
    error: unknown,
    variables: ConsumeOtpProps,
    context: unknown
  ) => void;
};

/**
 * Hook for consuming OTP.
 * @param options - Options for the mutation including onSuccess and onError callbacks
 * @returns A mutation hook for consuming OTP.
 */
export function useConsumeOtpMutation({
  onError,
  onSuccess,
}: UseConsumeOtpMutationOptions) {
  return useMutation({
    mutationFn: (input: ConsumeOtpProps) => consumeOtp(input),
    retry: false, // Disable retry on failure
    onSuccess,
    onError,
  });
}
