'use client'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { SearchInput } from './input'
import { SearchBody } from './body'
import { useCallback, type ReactNode } from 'react'
import 'swiper/css'
import './hide-swiper.module.css'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useBaseContext } from '@/context/base'
import {
  SearchBarProvider,
  useSearchBarContext,
} from '@/components/search-bar/context'

export const SearchBar = {
  mobile: (props: { children: ReactNode }) => (
    <SearchBarProvider>
      <Mobile {...props} />
    </SearchBarProvider>
  ),
  desktop: () => (
    <SearchBarProvider>
      <Desktop />
    </SearchBarProvider>
  ),
}

function Desktop() {
  const { updateFocus, isOpen, close } = useSearchBarContext()
  const elementHeight = useBaseContext().customizations?.element.clientHeight

  const handleOnInteractionOutside = useCallback(
    (e: any) => {
      e.preventDefault()
      setTimeout(() => {
        const searchElement = document.getElementById(
          'search-input',
        ) as HTMLInputElement
        // eslint-disable-next-line eqeqeq
        const focus = document.activeElement == searchElement
        if (!focus) close()
        if (!focus && searchElement) searchElement.value = ''
        updateFocus(focus, false)
      }, 200)
    },
    [focus],
  )

  return (
    <Popover open={isOpen}>
      <PopoverTrigger className='bg-transparent'>
        <SearchInput.desktop />
      </PopoverTrigger>
      <PopoverContent
        side='bottom'
        sideOffset={10}
        avoidCollisions
        className='w-96 overflow-clip rounded-2xl p-0'
        style={{ height: elementHeight ? elementHeight * 0.75 : '50vh' }}
        onOpenAutoFocus={(e) => {
          e.preventDefault()
        }}
        onFocus={() => {
          updateFocus(false, true)
        }}
        onInteractOutside={handleOnInteractionOutside}>
        <SearchBody />
      </PopoverContent>
    </Popover>
  )
}

function Mobile({ children }: { children: ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger className='bg-transparent'>{children}</SheetTrigger>
      <SheetContent
        onInteractOutside={(e: any) => {
          e.preventDefault()
        }}
        showDefaultClose={false}
        className='w-full border-0 p-0 outline-0'
        side='right'>
        <SearchInput.mobile />
        <SearchBody />
      </SheetContent>
    </Sheet>
  )
}
