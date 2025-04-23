import { Links as PrimitiveLinks } from '@/components/links'
import type { CommunityDetailsType } from './schema'

type LinksPropsType = { socialLinks: CommunityDetailsType['social_links'] }

export function Links({ socialLinks }: LinksPropsType) {
  return (
    <>
      {/* <Categories communityDetails={communityDetails} /> */}
      {/* Here reddit, discord and social Url is missing */}
      <p className='my-2 text-title-3-bold'>Links</p>
      <PrimitiveLinks
        className='mb-4'
        links={{
          instagram: socialLinks.insta?.url ?? '',
          linkedin: socialLinks.linkedin?.url ?? '',
          twitter: socialLinks.twitter?.url ?? '',
          webUrl: socialLinks.social_web_url ?? '',
        }}
      />
    </>
  )
}
