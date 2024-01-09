import { type Metadata } from 'next'
import { MainComponent } from './main-component'
import { fetchUserData } from '@lib/api/profile'

interface CompProps {
  params: {
    nickname: string
  }
  searchParams: Record<string, unknown>
}

export default async function Component({ params }: CompProps) {
  const profileData = await fetchUserData(params.nickname)
  return <MainComponent profileData={profileData} />
}

export async function generateMetadata({ params }: CompProps): Promise<Metadata> {
  const data = await fetchUserData(params.nickname)
  const title = `${data.name} (@${data.nickname}) is on Genuin`
  let desc = `${
    Boolean(data.name) && data.name.replace(/\s+/g, '') !== ''
      ? `${data.name.trim()} (@${data.nickname})`
      : `@${data.nickname}`
  } on Genuin`
  if (data?.bio !== '') {
    desc += ` | ${data.bio}`
  }

  return {
    title,
    applicationName: 'Genuin',
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: `${process.env.NEXT_PUBLIC_HOST_URL}/p/${data.nickname}`,
      images: [
        {
          url: data.preview_image,
        },
      ],
    },
  }
}
