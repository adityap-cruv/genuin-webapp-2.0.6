import { type Metadata } from 'next'
import { ProfileClientPage } from './client-page'
import { fetchMetadata } from '@lib/api/meta-data'
import { PATH_NAME } from '@lib/utils/constants/path'

interface Props {
  params: { nickname: string }
  searchParams: Record<string, unknown>
}

export default async function ProfilePage({ params }: Props) {
  const resolvedParams = await params
  return <ProfileClientPage nickname={resolvedParams.nickname} />
}

interface ProfileDataType {
  title: string
  description: string
  preview_image: string
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const profileData: ProfileDataType = await fetchMetadata({ type: 4, slug: resolvedParams.nickname })
  return {
    title: profileData?.title,
    description: profileData?.description,
    openGraph: {
      title: profileData?.title,
      description: profileData?.description,
      url: `${process.env.NEXT_PUBLIC_HOST_URL}` + PATH_NAME.profile(resolvedParams.nickname),
      images: [{ url: profileData?.preview_image }],
    },
  }
}
