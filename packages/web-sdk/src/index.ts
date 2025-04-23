// Import constants and functions
import loadIframeIntoDiv from './iframeLoader'
import {
  generateConfiguredUrl,
  extractPathsAndParams,
  generatePathFromConfig,
  parseColors,
  getApiUrl,
} from '@/utils'
import {
  type AuthUser,
  BrandDetailsConfigType,
  EmbedDataType,
  SDKAPI,
  SDKConfig,
  SDKInitConfig,
} from './type'
import { ACCESS_TOKEN_KEY, API_BASE_URL } from '@/const'
import { loadEmbedView, loadErrorView } from './views/loader'
import { loadRudderStack } from './views/loader'
import { getAuthenticatedUserDetails, miniProfile } from './views/api/auth'

// Expose both initialization methods to window
declare global {
  interface Window {
    onGenuinReady?: (sdk: SDKAPI) => void
    genuin?: {
      init: typeof init
    }
  }
}

window.genuin = {
  init,
}

// Function to load a div with a callback after a delay
function initializeDivWithCallback(
  divId: string,
  callback: (sdk: SDKAPI) => void,
): void {
  const div = document.getElementById(divId)
  let gConfig: SDKConfig
  if (div) {
    callback({
      initialize: (config: SDKConfig) => {
        gConfig = config
        div.style.setProperty('display', 'block')
        sdkInitiation(div, config)
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

// Add new manual initialization function
function init(configOrObject?: { config: SDKInitConfig } | SDKInitConfig): void {
  // If onGenuinReady is there don't execute in init.
  if (window.onGenuinReady) return
  const div = document.getElementById('gen-sdk')

  if (!div) {
    console.error('Div element is required')
    return
  }

  // Handle both initialization patterns
  const config = configOrObject 
    ? ('config' in configOrObject ? configOrObject.config : configOrObject)
    : {}

  // Validate required fields
  const missingFields = []
  if (!config.embed_id) missingFields.push('embed_id')
  if (!config.api_key) missingFields.push('api_key')

  if (missingFields.length > 0) {
    const errorMessage = `Missing required fields: ${missingFields.join(', ')}. Please pass the config object this format:
    window.genuin.init({
      embed_id: 'your_embed_id',
      api_key: 'your_api_key',
      token: 'your_token' (optional)
    })`
    console.error(errorMessage)
    return
  }

  div.style.setProperty('display', 'block')
  sdkInitiation(div, config)
}

// Execute the script when the page loads
// This is equivalent to DOMContentLoaded event
document.addEventListener('readystatechange', () => {
  if (document.readyState === 'complete') {
    if (!window.onGenuinReady) return
    initializeDivWithCallback('gen-sdk', window.onGenuinReady)
    window.addEventListener('message', (event) => {
      // if (event.origin !== "http://localhost") return; // Adjust the origin accordingly
      // console.log('Message received from iframe:', )
      const received_obj = event.data
      if (received_obj && received_obj.action === 'open_link') {
        console.log('inside link')
        window.open(received_obj.link, '_blank')
      }
    })
  }
})

// Function to initialize the SDK
async function sdkInitiation(container: HTMLElement, config: SDKConfig) {
  // Remove the access token if it is not provided, It is required for authentication
  if (!config.token) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
  
  if (!container) {
    console.log('Unable to load, no container found')
    return
  }

  if (container.getAttribute('data-initialized')) {
    console.error(
      'SDK is already initialized. Multiple initializations are not allowed.',
    )
    return
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

  // TODO: This is for type carousel.
  if (config.embed_id) {
    loadRudderStack()
    let embedData: EmbedDataType = {
      name: '',
      style: 'carousel',
      type: 'brand_feed',
      brand_id: config?.brand_id?.toString() || '',
      customization: {},
      embed_id: 'preview',
      environment: '',
      brandDetails: {} as any,
    }

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
        user = await getAuthenticatedUserDetails(config.token, config.brand_id);
        if (user) {
          user.autoLoginToken = config.token;
        }
      } else if (accessToken) {
        user = (await miniProfile()).data;
      }
      
      // Remove the access token if authentication fails. It was causing the issue in the authentication flow.
      if (!user) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
      }

      embedData.brandDetails = brandData
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

// Function to load a page into the container
function loadPageByPage(
  container: HTMLElement,
  page: string,
  subdomain?: string,
): void {
  const param: SDKConfig = {
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
