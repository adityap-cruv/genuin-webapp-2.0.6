import { useEmbedConfig } from '@/components/embed/embed-config-provider'
import React from 'react'
import { useShallow } from 'zustand/react/shallow'

type MultiEmbedProps = {
  genSdkId: number
  style?: React.CSSProperties
  dataEmbedId: string
}

const MultiEmbed: React.FC<MultiEmbedProps> = ({ dataEmbedId, style, genSdkId }) => {
  const { config } = useEmbedConfig(
    useShallow((state) => ({
      config: state.config,
    }))
  )
  return (
      <div
        id={`gen-sdk-${genSdkId}`}
        className="gen-sdk-class w-full max-w-full bg-monochrome-white rounded-xl"
        data-embed-id={dataEmbedId}
        data-api-key={config?.api_key}
        // data-embed-id={'67ac30f482a7e0ab69dfe3ec'}
        // data-api-key="0a2b8f8c568584a6302a8944aa865a508b3f9dcf2e2bffd6"
        style={{ ...style }}></div>
  )
}

export default MultiEmbed
