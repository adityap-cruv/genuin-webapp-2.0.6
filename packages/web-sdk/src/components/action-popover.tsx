import { CustomLink } from '@/router/custom-link'
import { CloseIcon } from './icons/close-icon'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { useEffect, useState } from 'react'
import { AnchorIcon } from './icons/anchor'
import { useBaseContext } from '@/context/base'

export function ActionPopover({
  content,
  children,
  offSet,
  params,
}: {
  content: string
  children: React.ReactNode
  offSet: number
  params: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const { embedData } = useBaseContext()

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined = undefined
    if (isOpen) {
      timer = setTimeout(() => {
        setIsOpen(false)
      }, 2400)
    }
    return () => {
      if (timer !== undefined) {
        clearTimeout(timer)
      }
    }
  }, [isOpen])

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className='cursor-pointer w-full'>{children}</div>
      </PopoverTrigger>
      <PopoverContent
        side='top'
        align='start'
        className='w-[94vw] mr-[3vw] p-4 bg-[#5786FF] transition-all duration-[650ms]'
        sideOffset={20}
        onInteractOutside={() => setIsOpen(false)}>
        <div className='relative flex justify-between items-center'>
          <p className='text-white font-normal text-[14px] tracking-wide'>
            <CustomLink
              href={embedData?.authInfo?.signInUrl + `?${params}`}
              className='font-bold underline'>
              Sign-in
            </CustomLink>
            <span className='text-white'> or </span>
            <CustomLink
              href={embedData?.authInfo?.signUpUrl + `?${params}`}
              className='font-bold underline'>
              sign-up
            </CustomLink>
            <span className='text-white'> {content}</span>
          </p>
          <CloseIcon
            onClick={() => setIsOpen(false)}
            variant='light'
            size='sm'
          />
          <AnchorIcon
            onClick={() => setIsOpen(false)}
            className='absolute -bottom-[140%]'
            style={{ left: offSet }}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
