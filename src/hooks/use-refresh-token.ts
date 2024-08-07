import { axiosInstance } from '@/lib/api/instance'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import axios from 'axios'
import { signOut, useSession } from 'next-auth/react'
import { useEffect } from 'react'

export function useRefreshToken() {
  const { update: updateSession, data: sessionData } = useSession()

  useEffect(() => {
    const interceptorId = axiosInstance.interceptors.response.use(
      (res) => res,
      async (error) => {
        try {
          const prevReq = error.config
          if (error.response.status === 401 && !prevReq.sent) {
            prevReq.sent = true
            const response = await refreshToken()
            if (response) {
              const { newAccessToken, newRefreshToken } = response
              await updateSession({
                ...sessionData,
                user: { ...sessionData?.user, accessToken: newAccessToken, refreshToken: newRefreshToken },
              })
              prevReq.headers.Authorization = `Bearer ${newAccessToken}`
              return await axiosInstance(prevReq)
            }
          }
        } catch (e) {
          // console.log('error::', e)
          void signOut()
        }
        return await Promise.reject(error)
      }
    )
    return () => {
      axiosInstance.interceptors.response.eject(interceptorId)
    }
  }, [])
}

export async function refreshToken(): Promise<{ newAccessToken: string; newRefreshToken: string } | null> {
  const oldRefreshToken = useGenuinOptions.getState().user?.refreshToken
  return await axios
    .create({ baseURL: process.env.NEXT_PUBLIC_API_URL })
    .post(
      '/api/v4/auth/session/refresh',
      {},
      {
        headers: {
          Authorization: `Bearer ${oldRefreshToken}`,
        },
      }
    )
    .then((res) => {
      const accessToken = res.headers['gn-access-token']
      const newRefreshToken = res.headers['gn-refresh-token']
      return { newAccessToken: accessToken, newRefreshToken }
    })
    .catch((e) => {
      throw new Error('Something went wrong!')
    })
}
