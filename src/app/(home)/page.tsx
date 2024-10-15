// import { type Metadata } from 'next'
// import { HomeComponent } from '@/components/pages/index-pages/home'

// // TODO: optimize uses of dynamic function.
// export default async function Page() {
//   return (
//     <main className="font-manrope absolute inset-0 text-new-off-black">
//       <HomeComponent />
//     </main>
//   )
// }

// export async function generateMetadata(): Promise<Metadata> {
//   return {
//     title: 'Genuin - Create & Monetize Video Communities |  Retail Media & Commerce Media Solutions',
//     applicationName: 'genuin',
//     description:
//       "Unlock the power of Genuin's no-code platform to create and monetize video communities tailored for Retail and Commerce Media. Engage your audience, integrate partner content, and boost media revenue with our innovative solutions. Book a demo to elevate your digital ecosystem today",
//     openGraph: {
//       title: 'Genuin - Create & Monetize Video Communities |  Retail Media & Commerce Media Solutions',
//       description:
//         "Unlock the power of Genuin's no-code platform to create and monetize video communities tailored for Retail and Commerce Media. Engage your audience, integrate partner content, and boost media revenue with our innovative solutions. Book a demo to elevate your digital ecosystem today",
//       url: 'https://begenuin.com',
//       images: [
//         {
//           url: 'https://media.begenuin.com/backend_assets/new_genuin_preview.png',
//         },
//       ],
//     },
//   }
// }

import { HomePage } from '@/components/home'
import { type Metadata } from 'next'

export default function Home() {
  return <HomePage />
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Genuin - Create & Monetize Video Communities |  Retail Media & Commerce Media Solutions',
    applicationName: 'genuin',
    description:
      "Unlock the power of Genuin's no-code platform to create and monetize video communities tailored for Retail and Commerce Media. Engage your audience, integrate partner content, and boost media revenue with our innovative solutions. Book a demo to elevate your digital ecosystem today",
    openGraph: {
      title: 'Genuin - Create & Monetize Video Communities |  Retail Media & Commerce Media Solutions',
      description:
        "Unlock the power of Genuin's no-code platform to create and monetize video communities tailored for Retail and Commerce Media. Engage your audience, integrate partner content, and boost media revenue with our innovative solutions. Book a demo to elevate your digital ecosystem today",
      url: 'https://begenuin.com',
      images: [
        {
          url: 'https://media.begenuin.com/backend_assets/new_genuin_preview.png',
        },
      ],
    },
  }
}
