'use client'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { useEffect, useState } from 'react'
import { useAnimationControls, motion } from 'framer-motion'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import leftImg from '@images/infinity-splits/infinity-left.svg'
import rightImg from '@images/infinity-splits/infinity-right.svg'
import { LockIcon } from '@icons/LockIcon'
import { PrivateModal } from './modals/private'
type Props = {
  community: {
    name: string
    handle: string
    profileImage: string
    slug: string
    type: number | null
  }
  loop: {
    name: string
    slug: string
  }
}

let firstTimeLeft = true
let firstTimeRight = true
export function AnimatedInfinityView({ community, loop }: Props) {
  const leftControls = useAnimationControls()
  const rightControls = useAnimationControls()
  const [localState, setLocalState] = useState({
    loopName: loop.name,
    communityName: community.name,
    communityDp: community.profileImage,
  })

  useEffect(() => {
    if (!leftControls) return
    if (firstTimeLeft) {
      void leftControls.start({ rotateX: '0deg', transition: { ease: 'linear', duration: 0.4, repeat: 0 } })
      firstTimeLeft = false
    } else {
      leftControls.start({ rotateX: '90deg', transition: { ease: 'linear', duration: 0.4, repeat: 0 } }).then(
        () => {
          setLocalState((x) => {
            x.communityName = community.name
            x.communityDp = community.profileImage
            return { ...x }
          })
          void leftControls.start({ rotateX: '0deg', transition: { ease: 'linear', duration: 0.4, repeat: 0 } })
        },
        () => {}
      )
    }
  }, [community.handle])

  useEffect(() => {
    if (!rightControls) return
    if (firstTimeRight) {
      void rightControls.start({ rotateX: '0deg', transition: { ease: 'linear', duration: 0.4, repeat: 0 } })
      firstTimeRight = false
    } else {
      rightControls.start({ rotateX: '90deg', transition: { ease: 'linear', duration: 0.4, repeat: 0 } }).then(
        () => {
          setLocalState((x) => {
            x.loopName = loop.name
            return { ...x }
          })
          void rightControls.start({ rotateX: '0deg', transition: { ease: 'linear', duration: 0.4, repeat: 0 } })
        },
        () => {}
      )
    }
  }, [loop.slug])

  return (
    <div className="relative mb-2 flex w-full px-1">
      <motion.div
        initial={{ rotateX: '90deg' }}
        animate={leftControls}
        style={{
          background: `url(${leftImg.src})`,
          height: 60,
          backgroundRepeat: 'no-repeat',
          content: 'contents',
          backgroundPosition: 'center',
          objectFit: 'cover',
          backgroundSize: 'contain',
        }}
        className="relative w-full flex-1">
        <Link className="bg-red-50" href={{ pathname: PATH_NAME.community(community.slug) }}>
          <span className="absolute inset-0 flex h-full w-full items-center gap-x-2 pl-2">
            <CustomAvatar
              imageUrl={localState.communityDp}
              isAvatar={false}
              fallbackString={localState.communityName}
              className="h-6 w-6"
            />
            <span className="pr-5">
              <div className="flex items-center">
                <p className="line-clamp-1 w-full break-all text-body-1-med text-monochrome-white">
                  {localState.communityName}
                </p>
                {community.type === 2 && (
                  <PrivateModal>
                    <LockIcon className="h-5 w-5 stroke-tertiary" />
                  </PrivateModal>
                )}
              </div>
              <p className="line-clamp-1 w-full break-all text-cap-1-med text-monochrome-white/60">Browse Community</p>
            </span>
          </span>
        </Link>
      </motion.div>
      <motion.div
        style={{
          background: `url(${rightImg.src})`,
          height: 60,
          backgroundRepeat: 'no-repeat',
          content: 'contents',
          backgroundPosition: 'center',
          objectFit: 'cover',
          backgroundSize: 'contain',
        }}
        initial={{ rotateX: '90deg' }}
        animate={rightControls}
        className="relative flex-1 bg-blue">
        <Link className="h-full w-full" href={PATH_NAME.loop(loop.slug)}>
          <span className="absolute inset-0 block w-full flex-1 justify-end">
            <span className="flex h-full items-center justify-end">
              <div className="w-[85%]">
                <p className="line-clamp-1 break-all text-body-1-med text-monochrome-white">{localState.loopName}</p>
                <p className="line-clamp-1 text-cap-1-med text-monochrome-white/60">View Loop</p>
              </div>
            </span>
          </span>
        </Link>
      </motion.div>
    </div>
  )
}
