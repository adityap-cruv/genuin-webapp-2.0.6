import { X } from 'lucide-react'
import { useRef } from 'react'
import { Button } from '@components/ui/button'
import Image from 'next/image'
import icComment from '@icons/icCommentSecondary.svg'
import { useEffect } from 'react'

interface Props {
  communityHandle: string
  videoId: string
}

export function Comments({ communityHandle, videoId }: Props) {
  const animationEleRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={animationEleRef}
      style={{
        minWidth: '85%',
      }}
      className="absolute left-full top-0 z-[-1] h-full w-full items-start bg-monochrome-white px-2 pt-2 transition-[left] duration-300 ease-in">
      <div className="flex w-full items-center justify-between">
        <p className="text-title-lg">Comments</p>
        <X
          className="h-6 w-6 stroke-secondary"
          onClick={() => {
            animationEleRef.current?.classList.toggle('left-full')
          }}
        />
      </div>
      <NoComments />
    </div>
  )
}

function NoComments() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <Image src={icComment} alt="comment!" />
      <p className="mt-2 text-title-lg">No comments yet</p>
      <p className="text-body-lg">Be the first one to comment</p>
      <Button className="mt-2">
        <p className="m-2 text-title-lg text-monochrome-white">Get app to Comment</p>
      </Button>
    </div>
  )
}
