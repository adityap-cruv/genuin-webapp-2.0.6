type AnalyticsDataType = {
  channel: string
  embed_id: string
  brand_id: number
  user_id: string
  environment: string
  embed_type: string
  embed_style: string
  ip?: string
  content_category?: string
  phone_no?: string
  sdk_version?: string
  user_name?: string
  gen_user_id?: string
  gen_user_name?: string
}

export const ANALYTICS_DATA: AnalyticsDataType = {
  channel: 'web sdk',
  brand_id: 0,
  embed_id: '',
  embed_type: '',
  environment: '',
  user_id: '',
  embed_style: '',
  content_category: 'loop',
  phone_no: '',
  sdk_version: '',
  user_name: '',
  gen_user_id: '',
  gen_user_name: '',
}
export async function getIpAddress() {
  const response = await fetch('https://api.ipify.org?format=json')
  const data = await response.json()
  return data.ip
}

function cleanObject(obj: Record<string, any>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, value]) => value !== '' && value !== null && value !== undefined,
    ),
  )
}

export const Analytics = {
  track: (eventName: string, data?: Record<string, any>) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const rudderAnalytics = window.rudderanalytics
    const cleanedAnalyticsData = cleanObject(ANALYTICS_DATA)

    if (rudderAnalytics) {
      rudderAnalytics.track(eventName, {
        ...cleanedAnalyticsData,
        ...data,
      })
    }
  },
  EventNames: {
    Initialized: 'Embed Initialized',
    EmbedViewed: 'Embed Viewed',
    EmbedMaximized: 'Embed Maximized',
    EmbedCTAClicked: 'Embed CTA Clicked',
    FloatingEmbed: 'Floating Embed',
    VideoMaximized: 'Video Maximized',
    VideoMinimized: 'Video Minimized',
    VideoInview: 'Video Inview',
    VideoImpression: 'Video Impression',
    VideoStarted: 'Video Started',
    VideoPaused: 'Video Paused',
    VideoFirstQuartile: 'Video First Quartile',
    VideoWatched: 'Video Watched',
    VideoThirdQuartile: 'Video Third Quartile',
    VideoCompleted: 'Video Complete',
    VideoRepost: 'Repost',
    VideoSpark: 'Spark',
    VideoComment: 'Comment',
    VideoShared: 'Video Shared',
    VideoMuted: 'Muted',
    VideoUnmuted: 'Unmuted',
    CommunityShared: 'Community Shared',
    LinkoutsViewed: 'Link Viewed',
    LinkoutsClicked: 'Link Clicked',
    LinkoutsCTAClicked: 'Link CTA Button Clicked',
    BecomeCbRequestClicked: 'Become Cb Request Clicked',
    KsUsernameSet: 'Ks Username Set',
    SettingsClosed: 'Settings Closed',
    SubscriptionClicked: 'Subscription Clicked',
    LogOut: 'Log Out',
    SettingsContactUsFormSent: 'Settings Contact Us Form Sent',
    NotificationSettingsModified: 'Notification Settings Modified',
    KeywordSearched: 'Keyword Searched',
    CheckRecentSearch: 'Check Recent Search',
    ClearRecentSearch: 'Clear Recent Search',
    KeywordSearchCancel: 'Keyword Search Cancel',
  },
}
