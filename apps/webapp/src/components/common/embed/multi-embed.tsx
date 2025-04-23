import React, { useMemo } from 'react'

type MultiEmbedProps = {
  style?: React.CSSProperties
  dataEmbedId: string
  dataEmbedApiKey: string | undefined
}

const MultiEmbed: React.FC<MultiEmbedProps> = ({ dataEmbedId, dataEmbedApiKey, style }) => {
  const randomGenSdkId = useMemo(() => Math.floor(Math.random() * 1_000_000), [])

  return (
    <div
      id={`gen-sdk-${randomGenSdkId}`}
      className="gen-sdk-class w-full max-w-full rounded-xl bg-monochrome-white"
      data-embed-id={dataEmbedId}
      data-api-key={dataEmbedApiKey}
      style={{ boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.1)', ...style }}></div>
  )
}

export default MultiEmbed
