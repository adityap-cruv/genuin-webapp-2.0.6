import { type ComponentProps } from 'react'

type Props = ComponentProps<'svg'>
export function BillStreamlineIcon({ ...props }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      {...props}
      stroke="black">
      <path
        d="M7.86719 10.1636C7.86719 11.9317 9.78128 13.0368 11.3125 12.1527C12.0231 11.7425 12.4609 10.9842 12.4609 10.1636C12.4609 8.3954 10.5468 7.29037 9.01563 8.17443C8.305 8.58468 7.86719 9.34303 7.86719 10.1636Z"
        // stroke="#B4B4B4"
        strokeWidth="1.5"
      />
      <path
        d="M2.64453 16.1353C2.23032 16.1353 1.89453 15.7995 1.89453 15.3853V4.94141C1.89453 4.52719 2.23032 4.19141 2.64453 4.19141H17.682C18.0962 4.19141 18.432 4.52719 18.432 4.94141V15.3853C18.432 15.7995 18.0962 16.1353 17.682 16.1353H2.64453Z"
        // stroke="#B4B4B4"
        strokeWidth="1.5"
      />
      <path
        d="M5.57031 19.811H21.3578C21.772 19.811 22.1078 19.4752 22.1078 19.061V7.86719"
        // stroke="#B4B4B4"
        strokeWidth="1.5"
      />
    </svg>
  )
}
