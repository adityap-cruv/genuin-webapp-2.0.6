import { useEffect, useRef, useMemo } from 'react'
import { type ConfigType } from '@/lib/stores/genuin-options'

declare global {
  interface Window {
    genuin: {
      init: (config: object) => void
    }
  }
}

/**
 * There are only 7 types in embedConfigs: Home/Blog Embed | Home/Search Embed | Home/Search Embed1 | Home/Post Sales Embed | PDP Embed | Post-Sales Embed | Blog Embed
 */
export type EmbedConfigsType = Record<string, { embedId: string; embedType: string; embedApiKey: string | undefined }>

export function useEmbedSetup({ config }: { config: ConfigType | undefined }) {
  const initializedRef = useRef(false)

  // TODO CHNAGE FOR PROD SCRIPT
  // const defaultEmbedConfigs = {
  //   'Home/Search Embed': {
  //     embedId: '67c55cdac71e679e40b2497c',
  //     embedType: 'brand_feed',
  //     embedApiKey: '0bb6e6e8667a66183edeafa919f4f1b3e725a92021fa5b87',
  //   },
  //   'Blog Embed': {
  //     embedId: '67c55cdac71e679e40b2497d',
  //     embedType: 'brand_feed',
  //     embedApiKey: '0bb6e6e8667a66183edeafa919f4f1b3e725a92021fa5b87',
  //   },
  //   'Home/Search Embed1': {
  //     embedId: '67c55cdac71e679e40b2497e',
  //     embedType: 'brand_feed',
  //     embedApiKey: '0bb6e6e8667a66183edeafa919f4f1b3e725a92021fa5b87',
  //   },
  //   'Post-Sales Embed': {
  //     embedId: '67c55cdac71e679e40b2497f',
  //     embedType: 'brand_feed',
  //     embedApiKey: '0bb6e6e8667a66183edeafa919f4f1b3e725a92021fa5b87',
  //   },
  //   'PDP Embed': {
  //     embedId: '67c55cdac71e679e40b24980',
  //     embedType: 'brand_feed',
  //     embedApiKey: '0bb6e6e8667a66183edeafa919f4f1b3e725a92021fa5b87',
  //   },
  //   'Home/Blog Embed': {
  //     embedId: '67c55cdac71e679e40b24981',
  //     embedType: 'brand_feed',
  //     embedApiKey: '0bb6e6e8667a66183edeafa919f4f1b3e725a92021fa5b87',
  //   },
  //   'Home/Post Sales Embed': {
  //     embedId: '67c55cdac71e679e40b24982',
  //     embedType: 'brand_feed',
  //     embedApiKey: '0bb6e6e8667a66183edeafa919f4f1b3e725a92021fa5b87',
  //   },
  // }

  const defaultEmbedConfigs = {
    'Home/Search Embed': {
      embedId: '67c17f9fe0ac202848d7ac5c',
      embedType: 'brand_feed',
      embedApiKey: 'e895c22b1281e14ff16405aa54f1d68ac6238de9b709383c',
    },
    'Blog Embed': {
      embedId: '67c17f9fe0ac202848d7ac5d',
      embedType: 'brand_feed',
      embedApiKey: 'e895c22b1281e14ff16405aa54f1d68ac6238de9b709383c',
    },
    'Home/Search Embed1': {
      embedId: '67c17f9fe0ac202848d7ac5e',
      embedType: 'brand_feed',
      embedApiKey: 'e895c22b1281e14ff16405aa54f1d68ac6238de9b709383c',
    },
    'Post-Sales Embed': {
      embedId: '67c17f9fe0ac202848d7ac5f',
      embedType: 'brand_feed',
      embedApiKey: 'e895c22b1281e14ff16405aa54f1d68ac6238de9b709383c',
    },
    'PDP Embed': {
      embedId: '67c17f9fe0ac202848d7ac60',
      embedType: 'brand_feed',
      embedApiKey: 'e895c22b1281e14ff16405aa54f1d68ac6238de9b709383c',
    },
    'Home/Blog Embed': {
      embedId: '67c17f9fe0ac202848d7ac61',
      embedType: 'brand_feed',
      embedApiKey: 'e895c22b1281e14ff16405aa54f1d68ac6238de9b709383c',
    },
    'Home/Post Sales Embed': {
      embedId: '67c17f9fe0ac202848d7ac62',
      embedType: 'brand_feed',
      embedApiKey: 'e895c22b1281e14ff16405aa54f1d68ac6238de9b709383c',
    },
  }

  const embedConfigs = useMemo(() => {
    const configs: EmbedConfigsType = {}
    config?.default_embeds?.forEach((embed) => {
      configs[embed.name] = {
        embedId: embed._id,
        embedType: embed.type,
        embedApiKey: config.api_key,
      }
    })

    // Merge with default configs, ensuring all required keys are present
    return Object.keys(configs).length > 0 ? { ...defaultEmbedConfigs, ...configs } : defaultEmbedConfigs
  }, [config])

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const script = document.createElement('script')
    script.src = 'https://media.qa.begenuin.com/sdk/multi/gen_sdk.min.js'
    script.async = true
    script.onload = () => {
      if (window.genuin) {
        window.genuin.init({})
      }
    }

    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return { embedConfigs }
}
