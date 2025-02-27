import React from 'react'

type EmbedType =
  | 'home1'
  | 'home2'
  | 'home3'
  | 'home4'
  | 'search1'
  | 'search2'
  | 'pdp1'
  | 'post1'
  | 'post2'
  | 'blog1'
  | 'blog2'

type MultiEmbedProps = {
  type: EmbedType
  height?: string
  width?: string
}

const embedConfigs: Record<EmbedType, { id: string; embedId: string; height: string; width?: string }> = {
  home1: { id: 'gen-sdk-1', embedId: '67ac30f482a7e0ab69dfe3ec', height: '400px' },
  home2: { id: 'gen-sdk-2', embedId: '67ac30f482a7e0ab69dfe3ec', height: '600px' },
  home3: { id: 'gen-sdk-3', embedId: '67ac30f482a7e0ab69dfe3ee', height: '615px', width: '350px' },
  home4: { id: 'gen-sdk-4', embedId: '67beaab3938acf776e7a2aea', height: '750px', width: '100%' },
  search1: { id: 'gen-sdk-1', embedId: '67ac30f482a7e0ab69dfe3ec', height: '600px' },
  search2: { id: 'gen-sdk-2', embedId: '67ac30f482a7e0ab69dfe3ec', height: '600px', width: '300px' },
  pdp1: { id: 'gen-sdk-1', embedId: '67ac30f482a7e0ab69dfe3ec', height: '600px' },
  post1: { id: 'gen-sdk-1', embedId: '67ac30f482a7e0ab69dfe3ec', height: '400px' },
  post2: { id: 'gen-sdk-2', embedId: '67beaab3938acf776e7a2aea', height: '750px', width: '100%' },
  blog1: { id: 'gen-sdk-1', embedId: '67ac30f482a7e0ab69dfe3ec', height: '400px' },
  blog2: { id: 'gen-sdk-2', embedId: '67ac30f482a7e0ab69dfe3ee', height: '615px', width: '350px' },
}

const MultiEmbed: React.FC<MultiEmbedProps> = ({ type, height, width }) => {
  const config = embedConfigs[type]

  return (
    <div className="w-full max-w-full overflow-hidden rounded-xl">
      <div
        id={config.id}
        className="gen-sdk-class w-full max-w-full bg-monochrome-white shadow-md"
        data-embed-id={config.embedId}
        data-api-key="0a2b8f8c568584a6302a8944aa865a508b3f9dcf2e2bffd6"
        style={{ height: height ?? config.height, width: width ?? config.width }}></div>
    </div>
  )
}

export default MultiEmbed
