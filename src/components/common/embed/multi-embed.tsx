import { useEmbedConfig } from '@/components/embed/embed-config-provider'
import React from 'react'
import { useShallow } from 'zustand/react/shallow'

// const embedConfigs: Record<any, { id: string; embedId: string; height: string; width?: string }> = {
//   home1: { id: 'gen-sdk-1', embedId: '67ac30f482a7e0ab69dfe3ec', height: '400px' },
//   home2: { id: 'gen-sdk-2', embedId: '67ac30f482a7e0ab69dfe3ec', height: '600px' },
//   home3: { id: 'gen-sdk-3', embedId: '67ac30f482a7e0ab69dfe3ee', height: '615px', width: '350px' },
//   home4: { id: 'gen-sdk-4', embedId: '67beaab3938acf776e7a2aea', height: '750px', width: '100%' },
//   search1: { id: 'gen-sdk-1', embedId: '67ac30f482a7e0ab69dfe3ec', height: '600px' },
//   search2: { id: 'gen-sdk-2', embedId: '67ac30f482a7e0ab69dfe3ec', height: '600px', width: '300px' },
//   pdp1: { id: 'gen-sdk-1', embedId: '67ac30f482a7e0ab69dfe3ec', height: '600px' },
//   post1: { id: 'gen-sdk-1', embedId: '67ac30f482a7e0ab69dfe3ec', height: '400px' },
//   post2: { id: 'gen-sdk-2', embedId: '67beaab3938acf776e7a2aea', height: '750px', width: '100%' },
//   blog1: { id: 'gen-sdk-1', embedId: '67ac30f482a7e0ab69dfe3ec', height: '400px' },
//   blog2: { id: 'gen-sdk-2', embedId: '67ac30f482a7e0ab69dfe3ee', height: '615px', width: '350px' },
// }

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
    <div className="w-full max-w-full overflow-hidden rounded-xl">
      <div
        id={`gen-sdk-${genSdkId}`}
        className="gen-sdk-class w-full max-w-full bg-monochrome-white shadow-md"
        data-embed-id={dataEmbedId}
        data-api-key={config?.api_key}
        // data-embed-id={'67ac30f482a7e0ab69dfe3ec'}
        // data-api-key="0a2b8f8c568584a6302a8944aa865a508b3f9dcf2e2bffd6"
        style={{ ...style }}></div>
    </div>
  )
}

export default MultiEmbed
