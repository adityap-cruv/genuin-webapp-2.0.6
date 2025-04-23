// src/components/common/ShareButton.tsx
import React from 'react'
import { Button } from '@/components/ui/button'
import { BellIconOff } from '@/components/icons/bell-icon-off'
import { SubscribedBellIcon } from './icons/subscribed-bell-icon'

type SubscriptionButtonProps = {
  onClick: () => void
  isSubscribed: boolean
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
export default function SubscriptionButton({
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
