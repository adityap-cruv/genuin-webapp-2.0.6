// Import necessary modules and components from React and other libraries
import React from 'react'
import { Button } from '@/components/ui/button'
import { ShareIcon } from '@/components/icons/share-icon'
import { useAdaptiveShare } from '@/hooks/useAdaptiveShare'
import { useToast } from '@/components/ui/use-toast'

// TODO: Add Adaptive share functionality.
// TODO: Add toast functionality.
// Define the props type for the ShareButton component
type ShareButtonProps = {
  className?: string // Optional className for custom styling
  url: string // URL to be shared
}

// Define the ShareButton functional component
export default function ShareButton({ url, className }: ShareButtonProps) {
  // Get the share function from the useAdaptiveShare hook
  const { shareFn } = useAdaptiveShare()
  // Get the toast function from the useToast hook
  const { toast } = useToast()

  return (
    // Render a Button component with various props and event handlers
    <Button
      title='Copy Link' // Tooltip text for the button
      size='custom' // Custom size for the button
      variant='outline' // Outline variant for the button
      className={`group border border-solid border-primary p-[3px] ${className}`} // Apply custom styles and additional className
      onClick={async () =>
        // Handle the button click event
        await shareFn({
          shareLink: getCurrentShareUrl({ url }), // Generate the share link using the provided URL
          toast: () => toast({ title: 'Link Copied!', duration: 1000 }), // Show a toast notification when the link is copied
        })
      }>
      {/* Render the ShareIcon component inside the button */}
      <ShareIcon className='stroke-primary' />
    </Button>
  )
}

/**
 * This function will return share url from window.location.href.
 * Call this function client side only.
 * Make sure window object is there.
 */
export function getCurrentShareUrl({ url }: { url: string }) {
  const urlObj = new URL(url)
  // TODO: Get reviewed it from krunalbhai.
  urlObj.searchParams.append('utm_source', 'web_sdk')
  return urlObj.href
}
