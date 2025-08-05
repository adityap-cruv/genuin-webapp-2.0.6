// Import constants and functions
import loadIframeIntoDiv from './iframeLoader'
import {
  generateConfiguredUrl,
  extractPathsAndParams,
  generatePathFromConfig,
  parseColors,
  getApiUrl,
  getRandomNumber,
} from '@/utils'
import {
  type AuthUser,
  BrandDetailsConfigType,
  EmbedDataType,
  SDKAPI,
  SDKInitConfig,
  SDKConfig,
} from './type'
import { ACCESS_TOKEN_KEY, API_BASE_URL, TOPICS } from '@/const'
import { loadEmbedView, loadErrorView, loadRudderStack } from './views/loader'
import { getAuthenticatedUserDetails, miniProfile } from './views/api/auth'
import PubSub from 'pubsub-js'

// Expose both initialization methods to window
declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    onGenuinReady?: (sdk: SDKAPI) => void
    genuinAuth?: (data: any) => void
    genuin?: {
      init: typeof init
      update: typeof update
    }
  }
}

window.genuin = {
  init,
  update,
}

// Add these type definitions
type ValidationResult = {
  isValid: boolean
  missingFields: string[]
  errorMessage?: string
}

type embedsType = {
  embedData: EmbedDataType
  container: HTMLElement
  user: AuthUser | undefined
  brandName: string | undefined
}

const embeds = new Map<string, embedsType>()

let lastElementId: string = ''

// Extract validation functions
function validateConfig(config: SDKInitConfig): ValidationResult {
  const missingFields = []
  if (!config.embed_id) missingFields.push('embed_id')
  if (!config.api_key) missingFields.push('api_key')

  return {
    isValid: missingFields.length === 0,
    missingFields,
    errorMessage: missingFields.length
      ? `Missing required fields: ${missingFields.join(', ')}. Please pass the config object this format:
      window.genuin.init({
        embed_id: 'your_embed_id',
        api_key: 'your_api_key',
        token: 'your_token' (optional)
      })`
      : undefined,
  }
}

function validateDiv(div: Element): ValidationResult {
  const missingFields = []
  const embedId = div.getAttribute('data-embed-id')
  const apiKey = div.getAttribute('data-api-key')

  if (!embedId) missingFields.push('data-embed-id')
  if (!apiKey) missingFields.push('data-api-key')

  return {
    isValid: missingFields.length === 0,
    missingFields,
    errorMessage: missingFields.length
      ? `Missing required fields: ${missingFields.join(', ')}.
      Required attributes:
      - data-embed-id="your_embed_id"
      - data-api-key="your_api_key"`
      : undefined,
  }
}

// Function to load a div with a callback after a delay
function initializeDivWithCallback(
  div: HTMLElement,
  config: {
    embed_id: string
    api_key: string
    contextualParams?: SDKConfig['contextualParams']
    brand_ids?: number[]
    params?: SDKConfig['params']
  },
  callback: (sdk: SDKAPI) => void,
): void {
  if (!callback || !div) {
    console.error('Invalid callback or div for instance')
    return
  }

  // Generate a truly unique instance ID using timestamp and a random number
  const instanceId = `sdk-instance-${Date.now()}-${getRandomNumber(1, 1000000)}`
  div.setAttribute('data-instance-id', instanceId)
  let gConfig: SDKConfig

  callback({
    initialize: (sdkconfig: SDKConfig) => {
      gConfig = {
        api_key: config.api_key,
        embed_id: config.embed_id,
        ...sdkconfig,
      }
      div.style.setProperty('display', 'block')
      sdkInitiation(div, gConfig, instanceId)
    },
    loadPage: (page) => {
      loadPageByPage(div, page, gConfig?.subdomain)
    },
    setUser: (user) => {
      console.log('user :>> ', user)
    },
  })
}

// Execute the script when the page loads and handle iframe messages
const handleIframeMessage = (event: MessageEvent) => {
  const receivedObj = event.data
  if (receivedObj?.action === 'open_link') {
    window.open(receivedObj.link, '_blank')
  }
}

const initializeEmbed = (div: Element) => {
  // Mark div as initialized to prevent double initialization
  div.setAttribute('data-initialized', 'true')

  const embedId = div.getAttribute('data-embed-id')
  const apiKey = div.getAttribute('data-api-key')
  const lat = div.getAttribute('data-lat')
  const long = div.getAttribute('data-long')
  const page_context = div.getAttribute('data-page-context')
  const url = div.getAttribute('data-url')
  const brand_ids =
    div
      .getAttribute('data-brand-ids')
      ?.split(' ')
      .map((item) => parseInt(item)) || []

  if (!embedId) {
    console.error('Div is missing the data-embed-id attribute.')
    return
  }

  const config = {
    embed_id: embedId ?? '',
    api_key: apiKey ?? '',
    contextualParams: {
      page_context: page_context ?? null,
      geo: {
        lat: lat ?? null,
        long: long ?? null,
      },
      url: url ?? null,
    },
    brand_ids: brand_ids,
  }

  initializeDivWithCallback(
    div as HTMLElement,
    config,
    // @ts-expect-error desc
    window.onGenuinReady,
  )
}

/**
 * Updates the contextual parameters of the embed data and reloads the embed view.
 *
 * This function performs the following checks before updating:
 * - Returns early if the embed container is not initialized.
 * - Returns early if there is no embed data available.
 * - Returns early if no new contextual parameters are provided (i.e., `page_context`, `url`, `geo.lat`, and `geo.long` are all missing).
 *
 * If valid contextual parameters are provided, they are merged with the existing contextual parameters
 * in `embedData`, and the embed view is reloaded with the updated data.
 *
 * @param embedContextualParams - An object containing new contextual parameters to update.
 * @param embedContextualParams.contextualParams - The contextual parameters to merge into the existing embed data.
 */
function update(embedContextualParams: {
  contextualParams: SDKConfig['contextualParams']
  id: string | null | undefined
}) {
  // Return early if the embed container is not initialized
  const containerId = embedContextualParams.id
    ? embedContextualParams.id
    : lastElementId
  const embed: embedsType | undefined = embeds.get(containerId)
  if (!embed) return
  if (!embed.container?.getAttribute('data-initialized')) return

  // Return early if embed data is not available
  if (!embed.embedData) return

  // Return early if no new contextual parameters are provided
  if (
    !embedContextualParams.contextualParams ||
    (!embedContextualParams.contextualParams.page_context &&
      !embedContextualParams.contextualParams.url &&
      !embedContextualParams.contextualParams.geo?.lat &&
      !embedContextualParams.contextualParams.geo?.long)
  ) {
    return
  }

  // Merge new contextual parameters with the existing ones
  embed.embedData.contextualParams = {
    ...embed.embedData.contextualParams,
    ...embedContextualParams.contextualParams,
  }

  // Reload the embed view with updated contextual parameters
  loadEmbedView(embed.container, embed.embedData, embed.user, embed.brandName)
}

function init(
  configOrObject?: { config: SDKInitConfig } | SDKInitConfig,
): void {
  // If onGenuinReady is there don't execute in init.
  if (window.onGenuinReady) return
  const isEmptyObject =
    configOrObject &&
    !Object.keys(configOrObject).includes('embed_id') &&
    configOrObject.constructor === Object
  if (configOrObject && !isEmptyObject) {
    const div = document.getElementById('gen-sdk')
    if (!div) {
      console.error('Div element is required')
      return
    }

    if (div.getAttribute('data-initialized')) {
      console.error(
        'SDK is already initialized. Multiple initializations are not allowed.',
      )
      return
    }

    const config = configOrObject
      ? 'config' in configOrObject
        ? configOrObject.config
        : configOrObject
      : {}
    const validation = validateConfig(config)

    if (!validation.isValid) {
      console.error(validation.errorMessage)
      return
    }
    const instanceId = `sdk-instance-${Date.now()}-${getRandomNumber(1, 1000000)}`
    div?.setAttribute('data-instance-id', instanceId)

    div.style.setProperty('display', 'block')
    sdkInitiation(div, config, instanceId)
  } else {
    const embedDivs = document.querySelectorAll(
      '.gen-sdk-class:not([data-initialized])',
    )

    if (embedDivs.length === 0) {
      console.error('No embed divs found')
      return
    }

    embedDivs.forEach((div: Element) => {
      const validation = validateDiv(div)

      if (!validation.isValid) {
        console.error(validation.errorMessage)
        return
      }

      const instanceId = `sdk-instance-${Date.now()}-${getRandomNumber(1, 1000000)}`
      div?.setAttribute('data-instance-id', instanceId)

      const lat = div.getAttribute('data-lat')
      const long = div.getAttribute('data-long')
      const page_context = div.getAttribute('data-page-context')
      const url = div.getAttribute('data-url')
      const brand_ids =
        div
          .getAttribute('data-brand-ids')
          ?.split(' ')
          .map((item) => parseInt(item)) || []
      const isConfigObject =
        typeof configOrObject === 'object' &&
        configOrObject !== null &&
        'config' in configOrObject

      const sourceConfig = isConfigObject
        ? (configOrObject as { config: SDKInitConfig }).config
        : (configOrObject as any)

      const token = sourceConfig?.token ?? ''
      const params = sourceConfig?.params ?? ''
      const video = sourceConfig?.video ?? ''
      const action = sourceConfig?.action ?? ''

      const config: SDKConfig = {
        embed_id: div.getAttribute('data-embed-id') ?? '',
        api_key: div.getAttribute('data-api-key') ?? '',
        token: token,
        contextualParams: {
          page_context: page_context ?? null,
          geo: {
            lat: lat ?? null,
            long: long ?? null,
          },
          url: url ?? null,
        },
        brand_ids: brand_ids,
        params: params,
        video: video,
        action: action,
        authInfo: sourceConfig?.authInfo,
      }
      // div.style.setProperty('display', 'block')
      sdkInitiation(div as HTMLElement, config, instanceId)
    })
  }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const embedDivs = document.querySelectorAll(
    '.gen-sdk-class:not([data-initialized])',
  )

  if (embedDivs.length === 0) {
    console.error('No embed divs found')
    return
  }

  embedDivs.forEach(initializeEmbed)
  window.addEventListener('message', handleIframeMessage)
})

// Function to load a div with a callback after a delay
function initializeDivWithCallbackOld(
  divId: string,
  callback: (sdk: SDKAPI) => void,
): void {
  const div = document.getElementById(divId)
  const instanceId = `sdk-instance-${Date.now()}-${getRandomNumber(1, 1000000)}`
  div?.setAttribute('data-instance-id', instanceId)
  let gConfig: SDKConfig
  if (div) {
    callback({
      initialize: (config: SDKConfig) => {
        gConfig = config
        div.style.setProperty('display', 'block')
        sdkInitiation(div, config, instanceId)
      },
      loadPage: (page) => {
        loadPageByPage(div, page, gConfig?.subdomain)
      },
      setUser: (user) => {
        console.log('user :>> ', user)
      },
    })
  } else {
    console.error('Div with ID', divId, 'not found.')
  }
}

// Execute the script when the page loads
// This is equivalent to DOMContentLoaded event
document.addEventListener('readystatechange', () => {
  if (document.readyState === 'complete') {
    if (!window.onGenuinReady) return
    initializeDivWithCallbackOld('gen-sdk', window.onGenuinReady)
    window.addEventListener('message', (event) => {
      const received_obj = event.data
      if (received_obj && received_obj.action === 'open_link') {
        console.log('inside link')
        window.open(received_obj.link, '_blank')
      }
    })
  }
})

// Function to initialize the SDK
async function sdkInitiation(
  container: HTMLElement,
  config: SDKConfig,
  instanceId: string,
) {
  // Remove the access token if it is not provided, It is required for authentication
  if (!config.token) {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
  }

  if (!container) {
    console.error('No container found for', instanceId)
    return
  }

  if (!config?.api_key) {
    console.warn('Missing API key for', instanceId)
  }

  // Disabled it as part of optimization.
  // await checkIfInViewPort(container)

  // TODO: Enable this when we have api_key for all the clients
  if (config.embed_id && !config?.api_key) {
    console.log('api key is required for initializing the SDK')
    const empty_element = document.createElement('div')
    // display: flex;
    // justify-content: center; /* Horizontal alignment */
    // align-items: center; /* Vertical alignment */
    // width: 100%;
    // height: 100%;
    empty_element.style.display = 'flex'
    empty_element.style.justifyContent = 'center'
    empty_element.style.alignItems = 'center'
    empty_element.style.height = '100%'
    empty_element.style.width = '100%'
    empty_element.textContent = 'API Key is Required'
    container.appendChild(empty_element)
    // container.innerHTML="API Key is Required"
    return
  }

  let brandData: BrandDetailsConfigType = {} as BrandDetailsConfigType

  if (config?.api_key) {
    const searchParams = new URLSearchParams()
    searchParams.set('api_key', config.api_key)
    const response = await fetch(
      `${getApiUrl('/api/v3/brand/detail', searchParams)}`,
    )

    if (!response.ok) {
      loadErrorView(container)
      return
    }

    brandData = (await response.json()).data
    // Access the brand_id from the response data
    config.brand_id = brandData?.brand_id
    config.subdomain = brandData?.subdomain
    config.brand_colors = brandData?.brand_colors
    config.name = brandData?.name
  } else {
    config.subdomain = 'app'
  }

  config.embed = 1

  let path: string = '/'
  const params: Record<string, string | boolean | number> = {}
  const currentUrl = window.location.href

  for (const key in config) {
    params[key] = config[key as keyof SDKConfig]!
  }

  const result = extractPathsAndParams(currentUrl)
  if (result != null) {
    if (result.paths.length > 0) {
      path = path + result.paths.join('/')
    }
    if (result.queryParams) {
      for (const param of result.queryParams) {
        params[param.key] = param.value
      }
    }
  }
  let embedData: EmbedDataType = {
    name: '',
    style: 'carousel',
    type: 'brand_feed',
    brand_id: config.brand_id?.toString() || '',
    customization: {},
    embed_id: 'preview',
    environment: '',
    brandDetails: {} as any,
    contextualParams: {} as SDKConfig['contextualParams'],
    brand_ids: [] as number[],
    elementId: '',
  }

  if (config.embed_id) {
    loadRudderStack()
    // Fetch embed data if not in preview mode
    if (config.embed_id !== 'preview') {
      embedData = (await fetchEmbedData(config.embed_id)).data
    }

    // Override style and type if specified in config
    if (config.style) embedData.style = config.style
    if (config.type) {
      embedData.type = config.type as
        | 'brand_feed'
        | 'community_feed'
        | 'loop_feed'
    }

    if (
      embedData.style === 'carousel' ||
      embedData.style === 'feed' ||
      embedData.style === 'standard_wall'
    ) {
      if (config?.live_customization_data) {
        Object.assign(embedData.customization, config?.live_customization_data)
      }

      if (config.brand_id === 1939 && embedData.customization) {
        Object.assign(embedData.customization, {
          enable_brand_click: false,
          enable_community_click: false,
          show_join_community_button: false,
          show_view_loop_button: false,
          show_share_icon: false,
          show_comments_section: false,
        })
      }
      const parsedColors = parseColors(config.brand_colors)
      Object.keys(parsedColors).forEach((key) => {
        container.style.setProperty(key, parsedColors[key])
      })
      if (embedData.customization) {
        embedData.customization.brandColors = parsedColors
      }
      if (embedData.customization.theme === 'dark') {
        container.classList.add('dark')
      }
      // For the existing dark mode users
      if (container.classList.contains('gen-sdk-dark')) {
        container.classList.add('dark')
      }
      embedData.embed_id = config.embed_id
      let user: AuthUser | undefined = undefined
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
      if (config.token && config.brand_id) {
        user = await getAuthenticatedUserDetails(
          config.token,
          config.brand_id,
          config.params,
        )
        if (user) {
          user.autoLoginToken = config.token
        }
      } else if (accessToken) {
        user = (await miniProfile()).data
      }

      // Remove the access token if authentication fails. It was causing the issue in the authentication flow.
      if (!user) {
        localStorage.removeItem(ACCESS_TOKEN_KEY)
      }

      embedData.brandDetails = brandData
      embedData.elementId = container.id || `embed-${config.embed_id}`
      if (config.contextualParams === undefined) {
        embedData.contextualParams = {
          page_context: container.getAttribute('data-page-context') || null,
          geo: {
            lat: container.getAttribute('data-lat') || null,
            long: container.getAttribute('data-long') || null,
          },
          url: container.getAttribute('data-url') || null,
        }
      } else {
        embedData.contextualParams = config.contextualParams
      }
      if (config.brand_ids === undefined) {
        embedData.brand_ids =
          container
            .getAttribute('data-brand-ids')
            ?.split(' ')
            .map((item) => parseInt(item)) || []
      } else {
        embedData.brand_ids = config.brand_ids || []
      }
      // passing video slug to embedData to enable default expand view.
      embedData.startVideoSlug =
        container.getAttribute('data-video-id') ?? config.video ?? undefined
      embedData.action =
        container.getAttribute('data-action') ?? config.action ?? undefined

      if (config.authInfo) {
        embedData.authInfo = config.authInfo
      }

      const elementsId: string = container.getAttribute('id') ?? ''

      embeds.set(container.getAttribute('id') ?? '', {
        embedData: embedData,
        container: container,
        user: user,
        brandName: config.name,
      })
      lastElementId = elementsId

      loadEmbedView(container, embedData, user, config.name)

      // Mark div as initialized to prevent double initialization
      container.setAttribute('data-initialized', 'true')
    } else {
      loadIframeIntoDiv(
        container,
        generateConfiguredUrl(
          generatePathFromConfig(config, path),
          params,
          config?.subdomain || '',
        ),
      )
    }
  }
}

// Function to load a page into the container
function loadPageByPage(
  container: HTMLElement,
  page: string,
  subdomain?: string,
): void {
  const param = {
    embed: 1,
    subdomain: subdomain,
    hide_navbar: 0,
    api_key: '',
  }
  loadIframeIntoDiv(
    container,
    generateConfiguredUrl(page, param, subdomain ?? ''),
  )
}

async function fetchEmbedData(embedId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v3/embed?id=${embedId}`)

    if (!response.ok) {
      throw new Error('Something went wrong!')
    }

    const data = await response.json()
    return { status: true, data: data.data }
  } catch (error) {
    throw new Error('Something went wrong!')
  }
}

// async function checkIfInViewPort(element: HTMLElement) {
//   return new Promise((resolve) => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             resolve(true)
//             observer.disconnect()
//           }
//         })
//       },
//       { threshold: 0.3 },
//     )
//     observer.observe(element)
//   })
// }
