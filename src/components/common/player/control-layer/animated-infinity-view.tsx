import { CustomAvatar } from '@components/custom/custom-avatar'
import imgBar from '@images/empty-bottom-bar.svg'
import Image from 'next/image'

export function Testing() {
  return (
    <div
      className="duration-[400] relative mb-2 animate-spin px-1 ease-linear"
      style={{
        transform: 'rotateX(90deg)',
      }}>
      <Image src={imgBar} alt="bar" className="w-full" />
      <span className="absolute inset-0 flex ">
        <span className="block w-full flex-1 p-2">
          <div className="flex h-full w-full items-center gap-x-2">
            <CustomAvatar imageUrl="" isAvatar={false} fallbackString="no" className="h-8 w-8" />
            <span className="pr-5">
              <p className="line-clamp-1 w-full break-all text-body-sm font-medium text-monochrome-white">
                COMMUNITY_NAME
              </p>
              <p className="line-clamp-1 text-cap-lg font-medium text-monochrome-white/60">Browse Community</p>
            </span>
          </div>
        </span>
        <span className="block w-full flex-1 justify-end">
          <span className="flex h-full items-center justify-end">
            <div className="w-[85%]">
              <p className="line-clamp-1 break-all text-body-sm font-medium text-monochrome-white">LOOP_NAME</p>
              <p className="line-clamp-1 text-cap-sm font-medium text-monochrome-white/60">view Loop</p>
            </div>
          </span>
        </span>
      </span>
    </div>
  )
}
