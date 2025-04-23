import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Members } from './members'
import { CommunityLoops } from './community-loops'
import { useSizeContext } from '@/context/size'
import { CommunityDetailsType } from './schema'
import { Guidelines } from './guidelines'
import { Links } from './links'
import { Leaders } from './leaders'

type DetailsTabsPropsType = { slug: string } & AboutTabPropsType

export function DetailsTabs({ slug, ...aboutProps }: DetailsTabsPropsType) {
  const { isMobile } = useSizeContext()
  return (
    <Tabs
      defaultValue='Loops'
      style={{ height: 'calc(100% - 114px)' }}>
      <TabsList className='flex max-w-min'>
        <TabsTrigger value='Loops'>
          <p className='text-title-3-bold'>Groups</p>
        </TabsTrigger>
        <TabsTrigger value='Members'>
          <p className='text-title-3-bold'>Members</p>
        </TabsTrigger>
        {isMobile && (
          <TabsTrigger value='About'>
            <p className='text-title-3-bold'>About</p>
          </TabsTrigger>
        )}
      </TabsList>
      <hr className='border-t border-tertiary-200' />
      <TabsContent
        value='Loops'
        className='mr-2 h-full py-4'>
        <CommunityLoops slug={slug} />
      </TabsContent>
      <TabsContent value='Members'>
        <Members slug={slug} />
      </TabsContent>
      {isMobile && (
        <TabsContent value='About'>
          <AboutTab {...aboutProps} />
        </TabsContent>
      )}
    </Tabs>
  )
}

type AboutTabPropsType = {
  guidelines: CommunityDetailsType['guidelines']
  socialLinks: CommunityDetailsType['social_links']
  leader: CommunityDetailsType['leader']
  moderators: CommunityDetailsType['moderators']
}

function AboutTab({
  guidelines,
  socialLinks,
  leader,
  moderators,
}: AboutTabPropsType) {
  return (
    <>
      <Guidelines guidelines={guidelines} />
      <Links socialLinks={socialLinks} />
      <Leaders
        leader={leader}
        moderators={moderators}
      />
    </>
  )
}
