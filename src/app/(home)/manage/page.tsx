import Mobile from './mobile'
import Desktop from './desktop'
import { cookies } from 'next/headers'
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
//     title: 'Engage your consumers with partner content.',
//     applicationName: 'genuin',
//     description:
//       'Populate with both brand and performance content from partners, advertisers, and creators to ignite your community.',
//     openGraph: {
//       title: 'Engage your consumers with partner content.',
//       description:
//         'Populate with both brand and performance content from partners, advertisers, and creators to ignite your community.',
//       url: 'https://begenuin.com',
//       images: [
//         {
//           url: 'https://media.begenuin.com/backend_assets/new_genuin_preview.png',
//         },
//       ],
//     },
//   }
// }
