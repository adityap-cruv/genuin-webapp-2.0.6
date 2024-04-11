'use client'
import { CustomAvatar } from '@components/custom/custom-avatar'
import infynityLeft from '@images/infinity-splits/infinityLeft.svg'
import { useEffect, useState } from 'react'
import infynityRight from '@images/infinity-splits/infinityRight.svg'
import { useAnimationControls, motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { PATH_NAME } from '@lib/utils/constants/path'

type Props = {
  community: {
    name: string
    handle: string
    profileImage: string
    slug: string
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
            x.communityName = community.handle
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
    <span className="mb-2 flex px-1">
      <motion.div initial={{ rotateX: '90deg' }} animate={leftControls} className=" relative flex-1">
        <Link href={{ pathname: PATH_NAME.community(community.slug) }}>
          <Image src={infynityLeft} alt="bar" className="h-auto w-full min-w-max" />
          <span className="absolute inset-0 flex h-full w-full items-center gap-x-2 pl-2">
            <CustomAvatar
              imageUrl={localState.communityDp}
              isAvatar={false}
              fallbackString={localState.communityName}
              className="h-6 w-6"
            />
            <span className="pr-5">
              <p className="line-clamp-1 w-full break-all text-body-1-med text-monochrome-white">
                {localState.communityName}
              </p>
              <p className="w-full whitespace-nowrap text-cap-1-med text-monochrome-white/60">Browse Community</p>
            </span>
          </span>
        </Link>
      </motion.div>
      <motion.div initial={{ rotateX: '90deg' }} animate={rightControls} className="relative flex-1">
        <a href={PATH_NAME.loop(loop.slug)}>
          <Image src={infynityRight} alt="bar" className="h-auto w-full min-w-max" />
          <span className="absolute inset-0 block w-full flex-1 justify-end">
            <span className="flex h-full items-center justify-end">
              <div className="w-[85%]">
                <p className="line-clamp-1 break-all text-body-1-med text-monochrome-white">{localState.loopName}</p>
                <p className="line-clamp-1 text-cap-1-med text-monochrome-white/60">View Loop</p>
              </div>
            </span>
          </span>
        </a>
      </motion.div>
    </span>
  )
}
