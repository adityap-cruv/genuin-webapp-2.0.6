import { fetchCommunityDetails } from '@lib/api/community'
import { cookies } from 'next/headers'
import { MainComponent } from './main-component'

interface Props {
  params: {
    handle: string
  }
  searchParams: {}
}

export default async function Component({ params }: Props) {
  // const communityData = await fetchCommunityDetails(params.handle)
  const communityData = {
    info: {
      handle: 'genuincommunity',
      name: 'Post Genuin events',
      description: 'hello Genuin members',
      links: {
        instagram_url: 'https://www.instagram.com/genuin/',
        twitter_url: null,
        linkedin_url: null,
        social_web_url: 'begenuin.com',
      },
      count: {
        member: 22,
        loop: 5,
        video: 28,
      },
      profile_image:
        'https://media.qa.begenuin.com/uploads/profile_images/community/m/667d62bc-1352-429f-8aab-035244b1fc3e_20230822_123647.jpg',
      categories: ['Communities & Interests', 'Business', 'genuin events'],
    },
    popular_loops: [
      {
        subscriber_count: 1,
        name: 'Genuin long loop',
        description: 'Testing',
        share_string: '1913bbb9d1801400',
        profile_image:
          'https://media.qa.begenuin.com/uploads/profile_images/rt/s/F4A042F2-56E5-447C-BF72-807D24805A4D_1692876809127.jpeg',
      },
      {
        subscriber_count: 1,
        name: 'Aaaa',
        description: 'Aaaa',
        share_string: '191b5a7c12801587',
        profile_image: null,
      },
      {
        subscriber_count: 0,
        name: 'New lkpp',
        description: 'Check dp',
        share_string: '192341b275801676',
        profile_image: null,
      },
      {
        subscriber_count: 0,
        name: 'Ugufuf',
        description: 'J',
        share_string: '1916ab130a801689',
        profile_image: null,
      },
    ],
    moderators: [
      {
        role: 'moderator',
        name: null,
        nickname: 'vishal.nirmal',
        is_avatar: false,
        profile_image:
          'https://media.qa.begenuin.com/uploads/profile_images/s/233f0267-2245-40b2-9e5e-aa210c450e0a_20230616_162335.jpg',
        description: 'Hey!!!!!\nI am Lead Mobile Engineer at Genuin Inc',
      },
    ],
    members: [
      {
        role: 'member',
        name: 'Ankit Gabani',
        nickname: 'angabani',
        is_avatar: false,
        profile_image:
          'https://media.qa.begenuin.com/uploads/profile_images/s/BF70B60E-D0A0-43A2-A057-81F89B38CE84_1640844552938.jpeg',
        description: 'iOS Developer at Genuin 📲👨‍💻\nQuality is a 🎯 for me.\nગુજજુ\nLet’s connect!',
      },
      {
        role: 'member',
        name: '',
        nickname: 'sanket',
        is_avatar: true,
        profile_image: 'smiling_face_with_horns',
        description: null,
      },
    ],
  }
  const mobileCookie = cookies().get('mobile')?.value
  return <MainComponent communityDetails={communityData} isMobile={mobileCookie === 'true'} />
}
