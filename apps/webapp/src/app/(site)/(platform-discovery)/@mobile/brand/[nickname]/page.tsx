import { type Metadata } from 'next'
import { ProfileClientPage } from './client-page'
import { fetchMetadata } from '@lib/api/meta-data'
import { PATH_NAME } from '@lib/utils/constants/path'

interface Props {
  params: { nickname: string }
  searchParams: Record<string, unknown>
}

export default async function BrandPage({ params }: Props) {
  const resolvedParams = await params
  return <ProfileClientPage nickname={resolvedParams.nickname} forBrand />
}

interface BrandDataType {
  title: string
  description: string
  preview_image: string
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const brandData: BrandDataType = await fetchMetadata({ type: 6, slug: resolvedParams.nickname })
  return {
    title: brandData?.title,
    description: brandData?.description,
    openGraph: {
      title: brandData?.title,
      description: brandData?.description,
      url: `${process.env.NEXT_PUBLIC_HOST_URL}` + PATH_NAME.brand(resolvedParams.nickname),
      images: [{ url: brandData?.preview_image }],
    },
  }
}
