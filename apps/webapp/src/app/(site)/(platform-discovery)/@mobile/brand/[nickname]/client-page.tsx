import { ProfileDetails } from '@genuin/components/page/profile-details/profile-details'

interface Props {
  nickname: string
  forBrand?: boolean
}

export function ProfileClientPage({ nickname, forBrand = true }: Props) {
  return <ProfileDetails userName={nickname} forBrand={forBrand} />
}
