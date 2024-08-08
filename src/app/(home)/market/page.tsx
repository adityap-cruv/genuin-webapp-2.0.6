import { cookies } from 'next/headers'
import { Desktop } from './desktop'
import { Mobile } from './mobile'
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
//     title: 'Boost your incremental revenue.',
//     applicationName: 'genuin',
//     description:
//       'Monetize new vertical video inventory to increase time spent on your owned and operated channels, conversion and lifetime value.',
//     openGraph: {
//       title: 'Boost your incremental revenue.',
//       description:
//         'Monetize new vertical video inventory to increase time spent on your owned and operated channels, conversion and lifetime value.',
//       url: 'https://begenuin.com',
//       images: [
//         {
//           url: 'https://media.begenuin.com/backend_assets/new_genuin_preview.png',
//         },
//       ],
//     },
//   }
// }
