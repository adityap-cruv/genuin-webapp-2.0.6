import { ComponentProps } from 'react'
type NoContentProps = ComponentProps<'div'>

export function NoContents({ className, ...restProps }: NoContentProps) {
  return (
    <div
      className={
        'flex items-center justify-center w-full h-full bg-tertiary-200  text-body-1-bold' +
        ' ' +
        className
      }
      {...restProps}>
      <p className='text-tertiary'>No Content Available</p>
    </div>
  )
}
