import { Button } from '@components/ui/button'
import { motion, useAnimationControls } from 'framer-motion'
import { useEffect } from 'react'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { usePathname } from 'next/navigation'
import ShareButton from '@components/common/actions/ShareButton'

type Props = {
  /**
   * @default true
   */
  defaultOpen?: boolean
  /**
   * @default false
   */
  isOpen: boolean
  profileImage: string
  profileName: string
  profileNickname: string
  isAvatar: boolean
  shareUrl: string
}

export const TopStickyBar = {
  mobile: Mobile,
  desktop: Desktop,
}

function Desktop({
  defaultOpen = true,
  isOpen = false,
  profileImage,
  profileName,
  profileNickname,
  isAvatar,
  shareUrl,
  ...props
}: Props) {
  const navAnimationControl = useAnimationControls()
  const pathName = usePathname()
  const { user } = useGenuinOptions((state) => ({
    isEmbed: state.embed,
    parentUrl: state.parentUrl,
    user: state.user,
  }))

  useEffect(() => {
    if (defaultOpen || isOpen) {
      open()
    }
    if (!isOpen) {
      close()
    }
  }, [defaultOpen, isOpen])

  function open() {
    void navAnimationControl.start({ translateY: 0, transition: { duration: 0.2, ease: 'linear' } })
  }

  function close() {
    void navAnimationControl.start({ translateY: '-100%', transition: { duration: 0.2, ease: 'linear' } })
  }
  return (
    <motion.div
      animate={navAnimationControl}
      initial={{
        translateY: '-100%',
      }}
      className="sticky top-0 z-10 flex h-14 w-full items-center justify-between border-b border-tertiary-200 bg-monochrome-white px-6"
      {...props}>
      <span className="flex items-center gap-x-2">
        <CustomAvatar imageUrl={profileImage} fallbackString={profileName} isAvatar={isAvatar} className="h-8 w-8" />
        {profileName ? (
          <p className="text-title-2-demi">{profileName}</p>
        ) : (
          <p className="text-title-2-demi">@{profileNickname}</p>
        )}
      </span>
      <div className="flex gap-1">
        {pathName === PATH_NAME.profile(user?.nickname) && !user?.isBrandSystemUser && (
          <Link href={PATH_NAME.settings('edit')}>
            <Button
              size="custom"
              variant="outline"
              className="border border-primary"
              onClick={() => {
                localStorage.setItem('previous_path', pathName)
              }}>
              <p className="px-4 py-1 text-title-3-bold text-primary" style={{ fontSize: '15px' }}>
                Edit Profile
              </p>
            </Button>
          </Link>
        )}
        <ShareButton url={shareUrl} />
      </div>
    </motion.div>
  )
}

function Mobile({
  defaultOpen = true,
  isOpen = false,
  profileImage,
  profileName,
  profileNickname,
  isAvatar,
  ...props
}: Props) {
  const navAnimationControl = useAnimationControls()

  useEffect(() => {
    if (defaultOpen || isOpen) {
      open()
    }
    if (!isOpen) {
      close()
    }
  }, [defaultOpen, isOpen])

  function open() {
    void navAnimationControl.start({ translateY: 0, transition: { duration: 0.2, ease: 'linear' } })
  }

  function close() {
    void navAnimationControl.start({ translateY: '-100%', transition: { duration: 0.2, ease: 'linear' } })
  }
  return (
    <motion.div
      animate={navAnimationControl}
      initial={{
        translateY: '-100%',
      }}
      className="sticky top-0 z-10 flex h-14 w-full items-center justify-between border-b border-tertiary-200 bg-monochrome-white px-6"
      {...props}>
      <span className="flex items-center gap-x-2">
        <CustomAvatar imageUrl={profileImage} fallbackString={profileName} isAvatar={isAvatar} className="h-8 w-8" />
        {profileName ? (
          <p className="text-title-2-demi">{profileName}</p>
        ) : (
          <p className="text-title-2-demi">@{profileNickname}</p>
        )}
      </span>
    </motion.div>
  )
}
