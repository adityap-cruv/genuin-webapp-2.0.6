import dp1 from '@images/discover-communities/dp1.png'
import dp2 from '@images/discover-communities/dp2.png'
import dp3 from '@images/discover-communities/dp3.png'
import bg2 from '@images/discover-communities/bg2.png'
import bg3 from '@images/discover-communities/bg3.png'
import member1 from '@images/discover-communities/member1.png'
import member2 from '@images/discover-communities/member2.png'
import member3 from '@images/discover-communities/member3.png'
import video3 from '@images/discover-communities/video3.png'
import video2 from '@images/discover-communities/video2.png'
import video1 from '@images/discover-communities/video1.png'
import thumbnail1 from '@images/discover-communities/thumbnail1.png'
import thumbnail2 from '@images/discover-communities/thumbnail2.png'
import thumbnail3 from '@images/discover-communities/thumbnail3.png'
import thumbnail4 from '@images/discover-communities/thumbnail4.png'
import thumbnail5 from '@images/discover-communities/thumbnail5.png'
import thumbnail6 from '@images/discover-communities/thumbnail6.png'
import thumbnail7 from '@images/discover-communities/thumbnail7.png'
import thumbnail8 from '@images/discover-communities/thumbnail8.png'
import thumbnail9 from '@images/discover-communities/thumbnail9.png'
import frame1_mobile from '@images/maximize-your-outcomes/frame1_mobile.png'
import frame2_mobile from '@images/maximize-your-outcomes/frame2_mobile.png'
import frame3_mobile from '@images/maximize-your-outcomes/frame3_mobile.png'
import { Button } from '../ui/button'
// import CustomButton from '../custom/custom-button'
import CustomButton from '../custom/custom-button'
import Link from 'next/link'
// import { PATH_NAME } from '@/lib/paths'
import { PATH_NAME } from '@/lib/utils/constants/path'
// import { BCC_LOGIN_LINK } from '@/lib/const'
import { BCC_LOGIN_LINK } from '@/lib/constants'
import { PlayIcon } from '@icons/play-icon'

export function DiscoverCommunities() {
  const communityDetails = [
    {
      theme_color: '#50A6BD',
      community_url:
        'https://buzzcontinuum.begenuin.com/community/health-care-hub?utm_source=app_ios&utm_campaign=community&from_username=buzzcontinuum',
      community_name: 'Health Care Hub',
      community_dp: dp1,
      community_bg: null,
      community_description: 'Empowering medical learners with innovative insights for healthcare advancement.',
      members: 120,
      groups: 6,
      videos: 24,
      loop: {
        loop_url: 'https://buzzcontinuum.begenuin.com/loop/md-physitalks',
        loop_name: 'MD PhysiTalks',
        loop_handle: 'buzzcontinuum',
        time_ago: '1w',
        loop_description: 'MD/DO Physicians discussions on healthcare advancements and medical...',
        subscribers: 543,
        views: '5k',
        video: video1,
        members: [member1, member2, member3],
      },
      thumbnails: [
        {
          image: thumbnail1,
          url: 'https://buzzcontinuum.begenuin.com/video/1d310cc09080153a?community=1d2ec89eef800d10&loop=1d2ecbbf210016bb',
        },
        {
          image: thumbnail2,
          url: 'https://buzzcontinuum.begenuin.com/video/1d2ecf79e50016c7?community=1d2ec89eef800d10&loop=1d2ecbbf210016bb',
        },
        {
          image: thumbnail3,
          url: 'https://buzzcontinuum.begenuin.com/video/1d2eccc1410016c0?community=1d2ec89eef800d10&loop=1d2ecbbf210016bb',
        },
      ],
    },
    {
      theme_color: '#000',
      community_url:
        'https://community.dappzsports.com/community/baseball-buffs?utm_source=app_ios&utm_campaign=community&from_username=homezone',
      community_name: 'Baseball Buffs',
      community_dp: dp2,
      community_bg: bg2,
      community_description: 'Connect with fans to discuss MLB games, player performances, and historic moments.',
      members: 120,
      groups: 6,
      videos: 24,
      loop: {
        loop_url: 'https://community.dappzsports.com/loop/hall-of-fame',
        loop_name: 'Hall of Fame',
        loop_handle: 'john.doe123',
        time_ago: '1w',
        loop_description: 'Debate potential and current Hall of Famers.',
        subscribers: 543,
        views: '5k',
        video: video2,
        members: [member1, member2, member3],
      },
      thumbnails: [
        {
          image: thumbnail4,
          url: 'https://community.dappzsports.com/video/whos-got-the-hottest-card-rn-%F0%9F%A4%94?community=1cd2604c76800c07&loop=1cd26083a2001586',
        },
        {
          image: thumbnail5,
          url: 'https://community.dappzsports.com/video/who-you-taking-for-the-heisman-this-year-%F0%9F%91%80?community=1cd2604c76800c07&loop=1cd26083a2001586',
        },
        {
          image: thumbnail6,
          url: 'https://community.dappzsports.com/video/at-4-pm-we-make-hobby-history-%F0%9F%92%8E-live-from-the?community=1cd2604c76800c07&loop=1cd26083a2001586',
        },
      ],
    },
    {
      theme_color: '#ED2C23',
      community_url:
        'https://tiendas3b.begenuin.com/community/mascot-adventures-fun-loops?utm_source=app_ios&utm_campaign=community&from_username=homezone',
      community_name: 'Donde esta Beto?',
      community_dp: dp3,
      community_bg: bg3,
      community_description: 'Upload videos of our mascot’s adventures! Create fun loops & kepp the spirt alive.',
      members: 120,
      groups: 6,
      videos: 24,
      loop: {
        loop_url: 'https://tiendas3b.begenuin.com/loop/beloved-mascot-daily-adventures',
        loop_name: 'Life with Beto',
        loop_handle: 'tiendas_3b',
        time_ago: '1w',
        loop_description: 'A fun-filled loop starring our beloved mascot! Join his daily adventures & share the joy.',
        subscribers: 543,
        views: '5k',
        video: video3,
        members: [member1, member2, member3],
      },
      thumbnails: [
        {
          image: thumbnail7,
          url: 'https://tiendas3b.begenuin.com/video/tiendas-3b-efecto-wow-productos-buena-onda?community=1b6605131d800f85&loop=1b660e49728015ec',
        },
        {
          image: thumbnail8,
          url: 'https://tiendas3b.begenuin.com/video/tiendas-3b-dia-amor-amistad?community=1b6605131d800f85&loop=1b660e49728015ec',
        },
        {
          image: thumbnail9,
          url: 'https://tiendas3b.begenuin.com/video/botarga-3b-gallo-beto-campeon?community=1b6605131d800f85&loop=1b660e49728015ec',
        },
      ],
    },
  ]

  return (
    <div className="bg-[#F0EFFB]">
      <div className="container py-[36px] md:py-[60px]">
        <div className="flex flex-col items-center gap-4">
          <p className="w-fit rounded-[30px] border-2 border-gray-400 px-4 py-2 text-new-para-2-mobile tracking-[0.28px] text-gray-900 md:px-6 md:py-4 md:text-new-para-1 lg:px-8 lg:py-3 lg:tracking-[0.4px]">
            DISCOVER COMMUNITIES
          </p>
          <p className="text-center text-index-h4 md:text-index-h3">Where content and culture meet commerce</p>
          <p className="text-center text-cap-1-home-m font-semibold md:text-body-2-demi-home">
            Get inspired by hundreds of other communities across various interests, topics, and brands.
          </p>
        </div>

        <div className="pt-9 md:pt-12">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href="https://community.dappzsports.com/community/baseball-buffs?utm_source=app_ios&utm_campaign=community&from_username=homezone"
              className="flex w-full justify-center">
              <img fetchPriority="auto" src={frame1_mobile.src} alt={`frame`} className="block lg:hidden" />
            </Link>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href="https://tiendas3b.begenuin.com/community/mascot-adventures-fun-loops?utm_source=app_ios&utm_campaign=community&from_username=homezone"
              className="flex w-full justify-center">
              <img fetchPriority="auto" src={frame2_mobile.src} alt={`frame`} className="block lg:hidden" />
            </Link>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href={
                'https://buzzcontinuum.begenuin.com/community/health-care-hub?utm_source=app_ios&utm_campaign=community&from_username=buzzcontinuum'
              }
              className="flex w-full justify-center">
              <img fetchPriority="auto" src={frame3_mobile.src} alt={`frame`} className="block lg:hidden" />
            </Link>
          </div>
          <div className="hidden grid-cols-1 gap-6 lg:grid lg:grid-cols-3">
            {communityDetails.map((item, index) => (
              <Link
                href={item.community_url}
                target="_blank"
                rel="noopener noreferrer"
                key={index}
                className="w-full rounded-3xl bg-white">
                <div className="relative">
                  {item.community_bg && item.community_dp ? (
                    <img src={item.community_bg.src} className="h-16 w-full rounded-t-3xl" />
                  ) : (
                    <div className={`h-16 rounded-t-3xl bg-[#50A6BD]`} />
                  )}

                  <div className="mr-6 flex h-16 items-center justify-end">
                    <Button
                      className={`rounded-lg px-4 py-1.5 text-cap-1-demi-home text-white`}
                      style={{
                        background: `${item.theme_color}`,
                      }}>
                      Join
                    </Button>
                  </div>
                  {item.community_dp ? (
                    <img src={item.community_dp.src} className="absolute left-6 top-5 h-24 w-24 rounded-full" />
                  ) : (
                    <div className="absolute left-6 top-5 h-24 w-24 rounded-full border-2 border-white bg-[#50A6BD]" />
                  )}
                </div>

                <div className="flex flex-col gap-6 p-6 pt-0">
                  <div>
                    <p className="text-cap-1-bold-home">{item.community_name}</p>
                    <p className="my-3 line-clamp-2 text-cap-1-demi">{item.community_description}</p>
                    <div className="flex gap-4 text-cap-1-bold-home">
                      <p>
                        {item.members}
                        <span className="ml-1 text-cap-1-demi-home text-gray-600">Members</span>
                      </p>
                      <p>
                        {item.groups}
                        <span className="ml-1 text-cap-1-demi-home text-gray-600">Groups</span>
                      </p>
                      <p>
                        {item.videos}
                        <span className="ml-1 text-cap-1-demi-home text-gray-600">Videos</span>
                      </p>
                    </div>
                  </div>

                  <Link
                    href={item.loop.loop_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative w-full rounded-lg border border-monochrome-9 hover:border-[#CDDAFF] hover:bg-[#F3F6FF]">
                    <div className="flex flex-col gap-1 p-4">
                      <p className="text-cap-1-demi-home">{item.loop.loop_name}</p>
                      <p className="text-cap-1-bold text-[#707070]">
                        {item.loop.loop_handle} posted <span className="text-cap-1-demi">∙ 1w</span>
                      </p>
                    </div>
                    <div className="w-full rounded-b-lg border border-t-0 border-[#D4D4D4] bg-[#F9F9F9] p-4 text-cap-1-demi text-[#707070] group-hover:bg-[#E6ECFF]">
                      <div className="w-3/5 xl:w-3/4">
                        <div className="relative flex w-40 items-center">
                          <img src={item.loop.members[0].src} className="z-20 h-6 w-6 rounded-full" />
                          <img src={item.loop.members[1].src} className="absolute left-4 z-10 h-6 w-6 rounded-full" />
                          <img src={item.loop.members[2].src} className="absolute left-8 z-0 h-6 w-6 rounded-full" />
                          <p className="absolute left-16 line-clamp-1">You + 5 others</p>
                        </div>

                        <p className="my-2 line-clamp-2">{item.loop.loop_description}</p>
                        <p className="line-clamp-1">
                          {item.loop.subscribers} subscribers ∙ {item.loop.views} views
                        </p>
                      </div>
                    </div>

                    <div className="group absolute right-5 top-1/2 h-[80%] -translate-y-1/2 transform hover:opacity-90">
                      <div
                        className="absolute flex items-center justify-center rounded-full bg-[#00000066] p-1.5 pl-2 opacity-0 hover:opacity-100"
                        style={{
                          zIndex: 1,
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                        }}>
                        <PlayIcon />
                      </div>
                      <img
                        src={item.loop.video.src}
                        style={{
                          aspectRatio: 9 / 16,
                        }}
                      />
                    </div>
                  </Link>

                  <div className="grid grid-cols-3 gap-3">
                    {item.thumbnails.map((item, index) => (
                      <Link
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative hover:opacity-90"
                        key={index}>
                        <div
                          className="absolute flex items-center justify-center rounded-full bg-[#00000066] p-1.5 pl-2 opacity-0 group-hover:opacity-100"
                          style={{
                            zIndex: 1,
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                          }}>
                          <PlayIcon />
                        </div>
                        <img
                          src={item.image.src}
                          className="w-full"
                          style={{
                            aspectRatio: 9 / 16,
                          }}
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden justify-center gap-4 pt-9 md:pt-12 lg:flex">
          <Link href={BCC_LOGIN_LINK} target="_blank" rel="noopener noreferrer">
            <CustomButton
              variant="blue"
              className="rounded-full px-8 py-6 text-cap-1-bold-home md:text-index-h5-extra-bold"
              radius="rounded-[36px]"
              showIcon>
              Get Started
            </CustomButton>
          </Link>

          <Link href={PATH_NAME.explore()} target="_blank" rel="noopener noreferrer">
            <CustomButton
              variant="custom"
              className="rounded-full px-8 py-6 text-cap-1-bold-home md:text-index-h5-extra-bold"
              radius="rounded-[36px]"
              showIcon>
              Discover
            </CustomButton>
          </Link>
        </div>
      </div>
    </div>
  )
}
