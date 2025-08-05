import { Analytics } from "@/analytics";
import { getBaseHeaders } from "@/headers";
import { getApiUrl, getPlatform } from "@/utils";
import { DownloadDialogModal } from "./context";

export const sendGetAppLink = async (payload: { email?: string; mobile?: string; query_params?: string }) => {
    try {
      const response = await fetch(getApiUrl('/api/v3/send_download_link'), {
        method: 'POST',
        headers: getBaseHeaders(true),
        body: JSON.stringify(payload),
      })
  
      const resData = await response.json()
      return resData || null
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error resolving deep link:', error)
      return null
    }
  }

  type DeepLinkParams = {
    utmCampaign?: string
    utmSource?: string
    utmMedium?: string
    action?: string
    contentType?: string
    title: string
    description?: string
    previewImage: string
    pathName: string
    fromUserName?: string
    community?: string
    loop?: string
    searchParams?: Record<string, string>
  }
  
  export const generateDeepLink = async ({
    utmCampaign,
    utmSource,
    utmMedium,
    action,
    contentType,
    title,
    description,
    previewImage,
    pathName,
    fromUserName,
    community,
    loop,
    searchParams = {},
  }: DeepLinkParams): Promise<string> => {
    const queryParams = {}
    if (utmCampaign) {
      Object.assign(queryParams, { utm_campaign: utmCampaign })
    }
    if (utmSource) {
      Object.assign(queryParams, { utm_source: utmSource })
    }
    if (utmMedium) {
      Object.assign(queryParams, { utm_medium: utmMedium })
    }
    if (action) {
      Object.assign(queryParams, { action })
    }
    // if (sourceId) {
    //   Object.assign(queryParams, { source_id: sourceId })
    // }
    if (contentType) {
      Object.assign(queryParams, { content_type: contentType })
    }
    if (fromUserName) {
      Object.assign(queryParams, { from_username: fromUserName })
    }
    // if (parentId) {
    //   Object.assign(queryParams, { parent_id: parentId })
    // }
  
    if (community) {
      Object.assign(queryParams, { community })
    }
    if (loop) {
      Object.assign(queryParams, { loop })
    }
    const finalPayload = {
      query_params: { ...queryParams, ...searchParams },
      title,
      preview_url: previewImage,
      path_params: pathName,
    }
    if (description) {
      Object.assign(finalPayload, { description })
    }
  
    const web_cta  = DownloadDialogModal.getWebCta()
    const host = DownloadDialogModal.getDomainUrl()
    const isMobile = getIsMobile()

    // Construct the full URL
    const redirectionUrl = `${host}${finalPayload.path_params}?${new URLSearchParams(
      finalPayload.query_params
    ).toString()}`
  
    if (isMobile) {
      const shortLink = web_cta === 'app' ? DownloadDialogModal.getMobileAppUrl() : redirectionUrl
      if (web_cta === 'app') {
        Analytics.track( action !== '/' ? Analytics.EventNames.DownloadAppClicked :Analytics.EventNames.DownloadAppViewed, {
          device_type: getPlatform(),
          redirection_link: shortLink,
          action,
        })
      }
      return shortLink ?? ''
    } else {
      try {
        const res = await fetch(getApiUrl('/goservices/links/dynamic_link'), {
          method: 'POST',
          headers: getBaseHeaders(true),
          body: JSON.stringify(finalPayload),
        })
        
        const data = await res.json()
        const shortLink = data?.data?.shortLink
  
        if (web_cta === 'app') {
          Analytics.track(Analytics.EventNames.DownloadAppViewed, {
            device_type: getPlatform(),
            redirection_link: shortLink,
            action,
          })
        }
  
        return shortLink
      } catch (e) {
        return process.env.BASE_URL ?? ''
      }
    }
  }
  
  function getIsMobile(): boolean {
    if (typeof window === 'undefined') return false;
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /android|iphone|ipad|ipod|mobile/.test(userAgent);
  }
  