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
  element.target = '_self'
  element.click()
}

export async function rudderInitialize () {
  (function () {
    let e = (window.rudderanalytics = window.rudderanalytics || [])
    if (!Array.isArray(e)) {
      e = []
      window.rudderanalytics = e
    }
    e.methods = [
      'load',
      'page',
      'track',
      'identify',
      'alias',
      'group',
      'ready',
      'reset',
      'getAnonymousId',
      'setAnonymousId',
      'getUserId',
      'getUserTraits',
      'getGroupId',
      'getGroupTraits',
      'startSession',
      'endSession'
    ]
    e.factory = function (t) {
      return function () {
        e.push([t].concat(Array.prototype.slice.call(arguments)))
      }
    }
    for (let t = 0; t < e.methods.length; t++) {
      const r = e.methods[t]
      e[r] = e.factory(r)
    }
    e.loadJS = function (e, t) {
      const r = document.createElement('script')
      r.type = 'text/javascript'
      r.async = true
      r.src = 'https://cdn.rudderlabs.com/v1.1/rudder-analytics.min.js'
      const a = document.getElementsByTagName('script')[0]
      a.parentNode.insertBefore(r, a)
    }
    e.loadJS()
    e.load('2Rb3KQGzR3qyC6R3ljX4FkmBqZf', 'https://rudderstack.begenuin.com/')
    e.page()
  })()
}
