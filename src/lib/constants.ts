/**
 * This is mobile app download which will redirect to app store if it is iphone or else android.
 */
export const MOBILE_DOWNLOAD_APP_LINK = 'https://install.begenuin.com/86sn/cgs'
export const BCC_LOGIN_LINK = 'https://brands.begenuin.com/login'
/**
 * This is hiring link hiring page is hosted on {@link https://careers.begenuin.com | Careers}
 */
export const HIRING_LINK = 'https://careers.begenuin.com'
export const URL_TO_APP_STORE = 'https://apps.apple.com/US/app/id1511177838?mt=8'
export const URL_TO_PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.begenuin.begenuin'

export const LOGIN_SOURCE = {
  web_sdk: 1,
  white_label: 2,
  web: 3,
  mobile_app: 4,
  mobile_sdk: 5,
  bcc: 6,
  adreels: 7,
}

export const VERIFICATION_TYPE = {
  sms: 1,
  call: 2,
}

export const RECENT_SEARCH_CONTENT_TYPE: Record<'text' | 'community' | 'loop' | 'user' | 'video', number> = {
  community: 3,
  loop: 4,
  text: 1,
  user: 2,
  video: 5,
}

export const HOW_IT_WORKS = {
  rewards: [
    {
      icon: '',
      title: 'Engage with Videos & Earn Rewards',
      description: 'Watch videos, comment, spark, share or repost to earn reward credits.',
    },
    {
      icon: '',
      title: 'Join Challenges for More Rewards',
      description: 'Participate in challenges to boost your reward credits even further.',
    },
    {
      icon: '',
      title: 'Redeem Your Reward Credits',
      description: 'Redeem your reward credits as coupons, or complete challenges to convert them into cash earrings.',
    },
  ],
  cash: [
    {
      icon: '',
      title: 'Complete Challenges to Earn Cash',
      description: 'Join challenges and complete all the steps to convert your rewards into cash earnings.',
    },
    {
      icon: '',
      title: 'Deposit Your Cash Earnings',
      description: 'Easily deposit your cash earnings directly into your bank account anytime.',
    },
  ],
}
