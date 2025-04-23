import { Button } from '@/components/ui/button'
import { BackIcon } from '@/components/icons/back-icon'
import { goBack } from '@/router/context'
import { type ComponentProps } from 'react'
import { cn } from '@/utils'

type HeaderPropsType = {
  title: string
  showSubmitButton?: boolean
  /**
   * If true, the submit button will be disabled.
   */
  submitDisabled?: boolean
  /**
   * The text of the submit button.
   */
  submitText?: string
} & ComponentProps<'div'>

export function Header({
  title,
  showSubmitButton = true,
  submitDisabled = false,
  submitText = 'Save',
  className,
  ...restProps
}: HeaderPropsType) {
  return (
    <div
      className={cn(
        'sticky top-0 flex items-center border-b border-tertiary md:border-none bg-background p-4 md:px-8 md:py-4',
        className,
      )}
      {...restProps}>
      <div className='flex-shrink-0'>
        <BackIcon
          className='md:hidden'
          onClick={goBack}
        />
      </div>
      <div
        className={cn(
          'flex flex-grow justify-center sm:justify-start',
          showSubmitButton ? '-ml-6' : '', // Offset for BackIcon when centered
        )}>
        <p className='text-title-2-bold'>{title}</p>
      </div>
      {showSubmitButton ? (
        <div className='flex-shrink-0'>
          <Button
            variant='custom'
            type='submit'
            disabled={submitDisabled}
            className='py-0 text-title-3-demi text-primary'>
            {submitText}
          </Button>
        </div>
      ) : (
        <div className='flex-shrink-0 md:hidden'></div> // Empty div to maintain layout when button is hidden
      )}
    </div>
  )
}
