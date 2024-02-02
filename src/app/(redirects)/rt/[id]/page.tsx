import { permanentRedirect } from 'next/navigation'

interface Props {
  params: {
    id: string
  }
  searchParams: {
    v: string
  }
}

// TODO: do some R&D to move this code to /next.config.ts
export default function RedirectPage({ params, searchParams }: Props) {
  const linkToRedirect = '/v/' + searchParams.v + '?l=' + params.id
  permanentRedirect(linkToRedirect)
}
