import { type ComponentProps } from 'react'

type Props = ComponentProps<'svg'>

export function TwitterIcon({ ...props }: Props) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='20'
      className='fill-primary'
      {...props}
      viewBox='0 0 20 20'
      fill='none'>
      <path
        d='M10.8524 7.77267L7.08937 2.4138L7.04457 2.35H6.96661H2.5H2.21138L2.37724 2.5862L8.16559 10.8291L2.38735 17.401L2.16838 17.65H2.5H3.82333H3.89118L3.93598 17.599L8.93042 11.9183L12.9106 17.5862L12.9554 17.65H13.0334H17.5H17.7886L17.6228 17.4138L11.6176 8.8619L17.1238 2.59904L17.3427 2.35H17.0111H15.6878H15.62L15.5752 2.40096L10.8524 7.77267ZM9.73661 10.8258L9.14328 9.99536L4.59161 3.62475H6.25549L10.0206 8.89464L10.6139 9.72508L15.397 16.4196H13.7331L9.73661 10.8258Z'
        strokeWidth='0.3'
      />
    </svg>
  )
}
