"use client";

import { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useEffect } from "react";
import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import { refreshTokens } from "./token-refresh";
import { useAuthContext } from "./context";

function useTokenRefreshInterceptor() {
  const { updateUser, signOut, user } = useAuthContext();

  useEffect(() => {
    const interceptorId = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        if (error.code === "ERR_CANCELED") {
          return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const tokens = await refreshTokens(
            async (tokens) => {
              updateUser(tokens);
            },
            user?.accessToken,
            user?.refreshToken
          );

          if (tokens) {
            originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
            return axiosInstance(originalRequest);
          }

          signOut("/home");
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.response.eject(interceptorId);
    };
  }, [updateUser, signOut, user]);
}

export function TokenRefreshProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useTokenRefreshInterceptor();
  return <>{children}</>;
}
