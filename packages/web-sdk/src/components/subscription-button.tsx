// src/components/common/ShareButton.tsx
import React from 'react'
import { Button } from '@/components/ui/button'
import { BellIconOff } from '@/components/icons/bell-icon-off'
import { SubscribedBellIcon } from './icons/subscribed-bell-icon'
import { cn } from '@/utils'
import { Loader } from './loader'

type SubscriptionButtonProps = {
  onClick: () => void
  isSubscribed: boolean
  isLoading?: boolean
}

/**
 * SubscriptionButton component renders a button that toggles between subscribed and unsubscribed states.
 *
 * @component
 * @param {Object} props - The properties object.
 * @param {function} props.onClick - The function to call when the button is clicked.
 * @param {boolean} props.isSubscribed - A boolean indicating whether the user is currently subscribed.
 *
 * @returns {JSX.Element} A button element that displays different icons based on the subscription state.
 *
 * @example
 * // Example usage of SubscriptionButton component
 * <SubscriptionButton
 *   onClick={handleSubscriptionToggle}
 *   isSubscribed={true}
 * />
 *
 * @remarks
 * This component uses custom styles and icons to visually represent the subscription state.
 * The button has a custom size and a border with primary color.
 * When the user is subscribed, the `SubscribedBellIcon` is displayed with primary color fill and stroke.
 * When the user is not subscribed, the `BellIconOff` is displayed with a new off-white stroke.
 */
export function SubscriptionButton({
  onClick,
  isSubscribed,
}: SubscriptionButtonProps) {
  return (
    <Button
      size='custom'
      className={`border border-solid border-primary p-[3px]`}
      variant='outline'
      onClick={onClick}>
      {isSubscribed && (
        <SubscribedBellIcon className='fill-primary stroke-primary'></SubscribedBellIcon>
      )}
      {!isSubscribed && (
        <BellIconOff className='stroke-new-off-white'></BellIconOff>
      )}
    </Button>
  )
}

export function SubscriptionPillButton({
  onClick,
  isSubscribed,
  isLoading,
}: SubscriptionButtonProps) {
  return (
    <Button
      variant='custom'
      className='ml-1 flex gap-1.5 rounded-2xl bg-white px-3 py-1 text-cap-1-med'
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}>
      <div className='relative h-4 w-4 overflow-hidden'>
        <div
          className={cn(
            'absolute left-0 flex w-full flex-col transition-transform duration-300 ease-in-out',
            isLoading
              ? '-translate-y-[16px]'
              : isSubscribed
                ? '-translate-y-[32px]'
                : 'translate-y-0',
          )}>
          <BellIconOff
            className='h-4 w-4 stroke-black'
            variant='dark'
          />
          <div className='flex h-4 w-4 items-center justify-center'>
            <Loader className='h-4 w-4' />
          </div>
          <SubscribedBellIcon className='h-4 w-4 stroke-black' />
        </div>
      </div>
    </Button>
  )
}
