import Mobile from './mobile'
import Desktop from './desktop'
import { cookies } from 'next/headers'
import { type Metadata } from 'next'

export default async function Component() {
  const isMobile = (await cookies()).get('device_type')?.value === 'mobile'
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
//     title: 'Explore communities on Genuin.',
//     applicationName: 'genuin',
//     description:
//       'Whether you’re interested in home improvement, beauty, or sports, there’s a Genuin community for you.',
//     openGraph: {
//       title: 'Explore communities on Genuin.',
//       description:
//         'Whether you’re interested in home improvement, beauty, or sports, there’s a Genuin community for you.',
//       url: 'https://begenuin.com',
//       images: [
//         {
//           url: 'https://media.begenuin.com/backend_assets/new_genuin_preview.png',
//         },
//       ],
//     },
//   }
// }
