// import { AuthOptions } from 'next-auth'
// import CredentialsProvider from 'next-auth/providers/credentials'

// const authOptions: AuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: 'otp',
//       credentials: {
//         action: { label: 'Action', type: 'text' },
//         mobile: { label: 'Mobile Number', type: 'tel' },
//       },
//       async authorize(credentials, req) {
//         console.log('credentials::', credentials, 'request::', req)
//         if (credentials?.action === 'send-otp') {
//           console.log('send otp::', credentials, req)
//         } else {
//           console.log('verify otp::', credentials, req)
//         }
//         return null
//       },
//     }),
//   ],
//   pages: {
//     signIn: '/auth/login',
//     newUser: '/auth/signup',
//   },
//   callbacks: {},
// }

// export default authOptions
