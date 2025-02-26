import React, { useEffect } from 'react'

declare global {
  interface Window {
    genuin: {
      init: (config: object) => void
    }
  }
}

const MultiEmbedHome = ({ type }: { type: string }) => {
  useEffect(() => {
    window.genuin.init({})
  }, [])

  if (type === 'home1')
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

  if (type === 'home2')
    return (
      <div className="w-full max-w-full overflow-hidden">
        <div
          id="gen-sdk-2"
          className="gen-sdk-class w-full max-w-full"
          data-embed-id="677cbbb22a1d2596f5ed8ba4"
          data-api-key="3d9fbaa9ee0777b4c9bbf15303f7ce8108394b5dd9759af4"
          style={{ height: '600px' }}></div>
      </div>
    )

  if (type === 'home3')
    return (
      <div className="w-full max-w-full overflow-hidden">
        <div
          id="gen-sdk-3"
          className="gen-sdk-class w-full max-w-full"
          data-embed-id="67a5d6bba9ec70e12eb79679"
          data-api-key="3d9fbaa9ee0777b4c9bbf15303f7ce8108394b5dd9759af4"
          style={{ height: '615px', width: '350px' }}></div>
      </div>
    )

  if (type === 'home4')
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

export default MultiEmbedHome
