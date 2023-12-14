'use client'
import { abbreviateNumber } from '@lib/utils'
import { Button } from '@components/ui/button'
import Image from 'next/image'
import icShare from '@icons/icShareBlue.svg'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { useToast } from '@components/ui/use-toast'
import { Toaster } from '@components/ui/toaster'
import { CustomAvatar } from '@components/custom/custom-avatar'
import CustomDecorativeList from '@components/custom/custom-decorative-list'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@components/ui/accordion'

interface CompProps {
  profileData: any
}

export function MainComponent({ profileData }: CompProps) {
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()
  const communities = ['Community 1', 'Community 2']
  const loops = ['NY Techfund 2024', 'Wine Tasting']

  return (
    <>
      <div className="h-full w-full overflow-auto p-4">
        <div className="w-1/2">
          <CustomAvatar
            className="bg-slate-500 h-20 w-20 bg-red-40"
            fallbackString={profileData?.name}
            imageUrl={profileData?.profile_image}
            isAvatar={profileData?.is_avatar}
          />
          <div className="flex items-center py-1">
            <p className="line-clamp-1 text-title-lg">{profileData?.name}</p>
            <p className="line-clamp-1 text-body-sm text-monochrome">@{profileData?.nickname}</p>
          </div>
          <p className="text-new-para-3 py-1">{profileData?.bio}</p>
          <Stats profileData={profileData} />
          <Button
            variant="outline"
            size="sm"
            outlineColor="genuin-blue"
            onClick={async () =>
              await shareFn({
                shareLink: window.location.href,
                toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
              })
            }>
            <Image src={icShare} alt="share" height={22} width={22} />
            <p className="pl-2 text-title-sm text-blue">Share</p>
          </Button>
        </div>
        {communities.map((item: any, index: any) => (
          <div key={index}>
            &nbsp;
            <Accordion type="single" defaultValue="connect" collapsible>
              <AccordionItem value="connect" className="border-none ">
                <AccordionTrigger className="m-0 p-0">
                  <div className="flex items-center">
                    <CustomAvatar
                      className="bg-slate-500 h-11 w-11 bg-red-40"
                      fallbackString={profileData?.name}
                      imageUrl={profileData?.profile_image}
                      isAvatar={profileData?.is_avatar}
                    />
                    <div className="mx-2">
                      <p className="line-clamp-1 text-left text-title-md">{item}</p>
                      <p className="line-clamp-1 text-new-para-2 text-monochrome">Visible to approved members only</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <CustomDecorativeList loopList={loops} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ))}
      </div>
      <Toaster />
    </>
  )
}

function Stats({ profileData }: { profileData: any }) {
  return (
    <div className="m-1 ml-0 flex max-w-[250px]  justify-between gap-x-6 p-1 pl-0">
      <div className="flex items-center">
        <p className="text-title-md">{abbreviateNumber(profileData?.views) || 0}</p>
        <p className="px-1 text-cap-lg text-secondary">Views</p>
      </div>
      <div className="flex items-center">
        <p className="text-title-md">{abbreviateNumber(profileData?.videos) || 0}</p>
        <p className="px-1 text-cap-lg text-secondary">Posts</p>
      </div>
      <div className="flex items-center">
        <p className="text-title-md">{abbreviateNumber(profileData?.replies) || 0}</p>
        <p className="px-1 text-cap-lg text-secondary">Communities</p>
      </div>
    </div>
  )
}
