import { Button } from '@components/ui/button'
import { motion, useAnimationControls } from 'framer-motion'
import { useEffect } from 'react'
import Image from 'next/image'
import icShare from '@icons/icShareBlue.svg'
import icQuestion from '@icons/icQuestion.svg'

type Props = {
  /**
   * @default true
   */
  defaultOpen?: boolean
  /**
   * @default false
   */
  isOpen: boolean
  loopName: string
  shareString: string
}

export function TopBar({ defaultOpen = true, isOpen = false, loopName, shareString, ...props }: Props) {
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
      className="sticky top-0 z-10 flex h-14 w-full items-center justify-between border-b border-monochrome-9 bg-monochrome-white px-6"
      {...props}>
      <span className="flex items-center gap-x-2">
        <p className="text-title-lg font-semibold">{loopName}</p>
      </span>
      <span className="my-2 flex gap-x-3">
        <Button className="px-4">
          <p>Subscribe</p>
        </Button>
        <Button variant="outline" className="border-primary px-4">
          <span className="flex items-center">
            <Image src={icQuestion} alt="question" />
            <p className="text-body-sm font-medium text-primary">Q&A</p>
          </span>
        </Button>
        <Button variant="outline"  className="border-primary">
          <Image src={icShare} alt="share" />
        </Button>
      </span>
    </motion.div>
  )
}
