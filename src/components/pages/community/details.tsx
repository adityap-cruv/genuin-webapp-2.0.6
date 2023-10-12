import type { CommunityDetailsType } from '@lib/schemas/community-details'
import { useState } from 'react'

let communityDetailsModule: CommunityDetailsType | null = null

interface Props {
  children: React.ReactNode
  communityDetails: CommunityDetailsType
}

export function CommunityDetails({ children, communityDetails }: Props) {
  communityDetailsModule = communityDetails
  if (communityDetails)
    return (
      <div className="min-w-tablet flex h-full w-full justify-between ">
        <Right />
        {children}
        <Left />
      </div>
    )
}

function Right() {
  // console.log('from right::', communityData1)
  const [_, r] = useState(0)
  return <div></div>
}

function Left() {
  return <div></div>
}
