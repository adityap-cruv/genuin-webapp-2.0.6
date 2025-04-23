import { type ComponentProps } from 'react'

type Props = ComponentProps<'svg'>

export function LogoutIcon({ ...props }: Props) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='32'
      height='32'
      viewBox='0 0 32 32'
      fill='none'
      stroke='black'
      {...props}>
      <path
        d='M21.606 4.08325C19.3297 2.2089 16.4557 1.18758 13.4907 1.19932C11.1032 1.21227 8.76898 1.89625 6.76147 3.1711C4.75395 4.44595 3.15635 6.25887 2.15582 8.39741C1.1553 10.5359 0.793322 12.9115 1.11231 15.2457C1.4313 17.5799 2.418 19.7761 3.95687 21.5769C5.49573 23.3777 7.52299 24.7085 9.80105 25.4133C12.0791 26.1182 14.5136 26.1679 16.8193 25.5566C19.1249 24.9454 21.2063 23.6985 22.8193 21.962'
        strokeWidth='2'
        strokeLinecap='round'
      />
      <path
        d='M7.3916 13.5L26.3916 13.5'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M20.3916 19.5L26.3916 13.5L20.3916 7.5'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}
