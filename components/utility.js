import axios from 'axios'

export const generateDeepLink = async ({
  utmCampaign,
  utmSource,
  utmMedium,
  action,
  sourceId,
  contentType,
  title,
  description,
  previewImage,
  pathName,
  fromUserName,
  parentId
}) => {
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
  if (sourceId) {
    Object.assign(queryParams, { source_id: sourceId })
  }
  if (contentType) {
    Object.assign(queryParams, { content_type: contentType })
  }
  if (fromUserName) {
    Object.assign(queryParams, { from_username: fromUserName })
  }
  if (parentId) {
    Object.assign(queryParams, { parent_id: parentId })
  }
  const finalPayload = {
    query_params: queryParams,
    title,
    preview_url: previewImage,
    path_params: pathName
  }
  if (description) {
    Object.assign(finalPayload, { description })
  }
  try {
    const res = await axios.post(`${process.env.apiurl}/api/v3/public/dynamic_link`, finalPayload)
    return res?.data?.data?.shortLink
  } catch (e) {
    return process.env.hostname
  }
}

export const openGeneratedLink = (link = '') => {
  const element = document.createElement('a')
  element.setAttribute('href', link)
  element.target = '_blank'
  element.click()
}