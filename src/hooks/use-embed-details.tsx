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

  const embedConfigs = useMemo(() => {
    const configs: EmbedConfigsType = {}
    config?.default_embeds?.forEach((embed) => {
      configs[embed.name] = {
        embedId: embed._id,
        embedType: embed.type,
        embedApiKey: config.api_key,
      }
    })
    return configs
  }, [config])

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    window.genuin.init({})
  }, [])

  return { embedConfigs }
}
