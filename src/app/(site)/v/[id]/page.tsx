import axios from 'axios'

interface PageProps {
  params: {
    id: string
  }
  searchParams: {
    l: string
  }
}

export const dynamic = 'force-static'

export default async function Component(props: PageProps) {
  console.log('params:', props.searchParams.l)
  return <div>hello world..</div>
}
