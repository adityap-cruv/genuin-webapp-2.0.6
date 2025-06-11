import { encryptText } from "@genuin/components/lib/utils/encryption";
import { axiosInstance } from "@react-query/axios-instance";
import { API_PATHS } from "@react-query/paths";
import { getDeviceId } from "@lib/utils/device-id";
import { useMutation } from "@tanstack/react-query";

type SendOtpProps = Partial<{ email: string; phoneNumber: string }> & {
  isUpdate?: boolean;
};

export async function sendOtp({ email, phoneNumber, isUpdate }: SendOtpProps) {
  const deviceId = getDeviceId();
  return await axiosInstance
    .post(API_PATHS.AUTH_SEND_OTP, {
      phoneNumber: phoneNumber ? encryptText(phoneNumber, false) : undefined,
      email: email ? encryptText(email, false) : undefined,
      encrypted_device_id: deviceId ? encryptText(deviceId, true) : undefined,
      is_update_flow: isUpdate,
    })
    .then((res) => {
      return {
        codeSent: true as const,
        retryTime: res.data.data.retryTime,
        message: undefined,
        preAuthSessionId: res.data.data.preAuthSessionId,
        resDeviceId: res.data.data.deviceId,
      };
    })
    .catch((e) => {
      let message = "Something went wrong. Please try again!";
      const retryTime = Number(e.response.data.data?.retryTime);
      if (e.response.data.code === "5262") {
        message =
          "This number is linked to another account. Please use a different one.";
      }
      if (e.response.data.code === "5263") {
        message = isUpdate
          ? "Unable to send the code. Please use another phone number."
          : "Unable to send the code. Please use another phone number or email to log in.";
      } else if (e.response.data.code === "5205") {
        message = "Email already exists. Please try another one.";
      } else if (!isNaN(retryTime)) {
        if (retryTime < 1) {
          const minutes = Math.floor(retryTime / 60);
          if (minutes >= 1) {
            const leftSeconds = retryTime % 60;
            message = `Please try again after ${minutes < 10 ? `0${minutes}` : minutes}:${
              leftSeconds < 10 ? `0${leftSeconds}` : leftSeconds
            } minutes!`;
          } else {
            message = `Please try again after 00:${retryTime < 10 ? `0${retryTime}` : retryTime}!`;
          }
        }
      }

      return {
        codeSent: false as const,
        retryTime,
        message,
      };
    });
}

type SendOtpMutationCallbacks = {
  onSuccess?: (
    data: Awaited<ReturnType<typeof sendOtp>>,
    variables: SendOtpProps,
    context: unknown
  ) => void;
  onError?: (error: Error, variables: SendOtpProps, context: unknown) => void;
};

/**
 * This hook is used to send an OTP (One Time Password) to the user.
 * @param params - The parameters for sending the OTP.
 * @param callbacks - Optional onSuccess and onError callbacks.
 * @returns
 */
export function useSendOtpMutation({
  onError,
  onSuccess,
}: SendOtpMutationCallbacks) {
  return useMutation({
    mutationFn: sendOtp,
    retry: false,
    onSuccess,
    onError,
  });
}
