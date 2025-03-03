import React from 'react'

type MultiEmbedProps = {
  genSdkId: number
  style?: React.CSSProperties
  dataEmbedId: string
  dataEmbedApiKey: string | undefined
}

const MultiEmbed: React.FC<MultiEmbedProps> = ({ dataEmbedId, dataEmbedApiKey, style, genSdkId }) => {
  return (
    <div
      id={`gen-sdk-${genSdkId}`}
      className="gen-sdk-class w-full max-w-full rounded-xl bg-monochrome-white"
      data-embed-id={dataEmbedId}
      data-api-key={dataEmbedApiKey}
      // data-embed-id={'67ac30f482a7e0ab69dfe3ec'}
      // data-api-key="0a2b8f8c568584a6302a8944aa865a508b3f9dcf2e2bffd6"
      style={{ boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.1)', ...style }}></div>
  )
}

export default MultiEmbed
