import { permanentRedirect } from 'next/navigation'

interface Props {
  params: {
    id: string
  }
  searchParams: {
    v: string
  }
}

export default function RedirectPage({ params, searchParams }: Props) {
  console.log(searchParams, params)
  const linkToRedirect = '/v/' + searchParams.v + '?l=' + params.id
  permanentRedirect(linkToRedirect)
}
