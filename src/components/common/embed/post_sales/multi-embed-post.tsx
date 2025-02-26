import React, { useEffect } from 'react'

declare global {
  interface Window {
    genuin: {
      init: (config: object) => void
    }
  }
}

const MultiEmbedPostSales = ({ type }: { type: string }) => {
  useEffect(() => {
    window.genuin.init({})
  }, [])

  if (type === 'post1')
    return (
      <div className="w-full max-w-full overflow-hidden">
        <div
          id="gen-sdk-1"
          className="gen-sdk-class w-full max-w-full"
          data-embed-id="677cbbb22a1d2596f5ed8ba4"
          data-api-key="3d9fbaa9ee0777b4c9bbf15303f7ce8108394b5dd9759af4"
          style={{ height: '400px' }}></div>
      </div>
    )

  if (type === 'post2')
    return (
      <div className="w-full max-w-full overflow-hidden">
        <div
          id="gen-sdk-4"
          className="gen-sdk-class w-full max-w-full"
          data-embed-id="679a2b502dac77cbd776d1ea"
          data-api-key="3d9fbaa9ee0777b4c9bbf15303f7ce8108394b5dd9759af4"
          style={{ height: '750px', width: '100%' }}></div>
      </div>
    )
}

export default MultiEmbedPostSales
