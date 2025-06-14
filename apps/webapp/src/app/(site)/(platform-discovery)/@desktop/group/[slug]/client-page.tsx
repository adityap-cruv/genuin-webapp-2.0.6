import { GroupDetailsPage } from '@genuin/components/page/group-details/group-details'

interface Props {
  slug: string
}
export function GroupClientPage({ slug }: Props) {
  return <GroupDetailsPage slug={slug} />
}
