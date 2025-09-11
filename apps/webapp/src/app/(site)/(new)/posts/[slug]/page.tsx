import { CreatePost } from '@genuin/components/organisms/create-post'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function Page({ params }: Props) {
  const param = await params
  return <CreatePost postId={param.slug} />
}
