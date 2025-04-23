import { useEffect, useRef, useMemo } from 'react'
import { type ConfigType } from '@/lib/stores/genuin-options'
import { DEFAULT_EMBED_PROD, DEFAULT_EMBED_QA } from '@/lib/constants'

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

  const defaultEmbedConfigs = process.env.NEXT_PUBLIC_CURRENT_ENV === 'qa' ? DEFAULT_EMBED_QA : DEFAULT_EMBED_PROD

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

    const scriptSrc =
      process.env.NEXT_PUBLIC_CURRENT_ENV === 'qa'
        ? 'https://media.qa.begenuin.com/sdk/multi/gen_sdk.min.js'
        : 'https://media.begenuin.com/sdk/multi/gen_sdk.min.js'
    const script = document.createElement('script')
    script.src = scriptSrc
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
