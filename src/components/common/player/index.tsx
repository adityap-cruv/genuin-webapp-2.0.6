'use client'
import { useResponsive } from '@hooks/useResponsive'
import { InnerPlayer } from './inner-player'
import { ControlLayer } from './control-layer'

export default function Player({}) {
  const { height } = useResponsive()

  if (height) {
    const videoWidth = height * (9 / 16)
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div style={{ height: height, width: videoWidth }} className="relative">
          <InnerPlayer
            videoSizeBox={{ height, width: videoWidth }}
            videoSource="https://media.begenuin.com/temp_video/m3u8s/2f214cdf-8338-431e-9993-9ae4da0f306b_1665672371039/output.m3u8"
          />
          <div className="absolute left-0 top-0 h-full w-full bg-blue-10/25">
            <ControlLayer />
          </div>
        </div>
      </div>
    )
  }
}
