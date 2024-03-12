import { axiosInstance } from './instance'

export async function verifyEmail(token: string) {
  console.log('in')
  return await axiosInstance
    .get('/api/v3/verify_email_token', {
      params: {
        token,
      },
      baseURL: process.env.NEXT_PUBLIC_INTERNAL_API_URL,
    })
    .then((res) => {
      console.log(res)
      return { code: Number(res.data.code) }
    })
    .catch((e) => {
      console.log('error::', e)
      return { code: Number(e.response.data.code) }
    })
}

/**
 * 5033 / 401 - token has expired.
 * 1099 / 400 - An unexpected error occurred processing the request.
 * 5025 / 404 - Could not find the user.
 * 5100 / 500 - Could not update the user.
 * 5176 / 429 - Data has been expired.
 */
// export async function verifyEmail(token: unknown) {
//   if (!token)
//     return {
//       title: 'Oops, something went wrong!',
//       subtitle:
//         "We're sorry, but something went wrong. Please try again later or contact our support team for assistance on the app.",
//       error: true,
//     }

//   return await axiosInstance
//     .get(`${process.env.NEXT_PUBLIC_INTERNAL_API_URL}/api/v3/verify_email_token`, {
//       params: {
//         token,
//       },
//     })
//     .then((res) => {
//       if (res?.data?.code === 200) {
//         return {
//           title: 'Email successfully verified',
//           subtitle:
//             "Now you'll receive important updates and notifications about your account, new features, and exciting news straight to your inbox. You can go back to app now.",
//           error: false,
//         }
//       } else {
//         return {
//           title: 'Oops, something went wrong!',
//           subtitle:
//             "We're sorry, but something went wrong. Please try again later or contact our support team for assistance on the app.",
//           error: true,
//         }
//       }
//     })
//     .catch((e) => {
//       const code = e?.response?.data?.code
//       if (code === '1003' || code === '5176' || code === '5033') {
//         return {
//           title: 'Verification link expired',
//           subtitle:
//             "We're sorry, but it looks like the verification link has expired. Please request a new verification link from the app to verify your email address.",
//           error: true,
//         }
//       } else {
//         return {
//           title: 'Oops, something went wrong!',
//           subtitle:
//             "We're sorry, but something went wrong. Please try again later or contact our support team for assistance on the app.",
//           error: true,
//         }
//       }
//     })
// }
