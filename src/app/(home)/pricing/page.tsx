import { cookies } from 'next/headers'
import Desktop from './desktop'
import Mobile from './mobile'
import { type Metadata } from 'next'

export default function Component() {
  const isMobile = cookies().get('device_type')?.value === 'mobile'
  return isMobile ? <Mobile /> : <Desktop />
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  }
}

// export async function generateMetadata(): Promise<Metadata> {
//   return {
//     title: 'Community Plans for Every Need.',
//     applicationName: 'genuin',
//     description:
//       'Choose from three pricing plans. Enjoy full white-label capability, manage data, leverage advanced analytics, and utilize AI for audience engagement and growth.',
//     openGraph: {
//       title: 'Community Plans for Every Need.',
//       description:
//         'Choose from three pricing plans. Enjoy full white-label capability, manage data, leverage advanced analytics, and utilize AI for audience engagement and growth.',
//       url: 'https://begenuin.com',
//       images: [
//         {
//           url: 'https://media.begenuin.com/backend_assets/new_genuin_preview.png',
//         },
//       ],
//     },
//   }
// }
