import { type ComponentProps } from 'react'

type Props = ComponentProps<'svg'>
export function CustomUnmuteIcon({ ...props }: Props) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="black" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g id="SVG" clipPath="url(#clip0_48481_186340)">
        <path
          id="Vector"
          opacity="0.3"
          d="M3.33594 8.66842H5.22243L6.66897 10.115V5.88867L5.22243 7.33521H3.33594V8.66842Z"
          //   fill="#343A40"
        />
        <path
          id="Vector_2"
          d="M2 6.00096V10.001H4.66667L8 13.3343V2.66763L4.66667 6.00096H2ZM6.66667 5.88763V10.1143L5.22 8.66763H3.33333V7.3343H5.22L6.66667 5.88763ZM9.33333 5.3143V10.681C10.32 10.1943 11 9.18096 11 8.00096C10.9999 7.44238 10.8438 6.89493 10.5493 6.42026C10.2549 5.94559 9.83372 5.56256 9.33333 5.3143ZM9.33333 2.1543V3.52763C11.26 4.10096 12.6667 5.88763 12.6667 8.00096C12.6667 10.1143 11.26 11.901 9.33333 12.4743V13.8476C12.0067 13.241 14 10.8543 14 8.00096C14 5.14763 12.0067 2.76096 9.33333 2.1543Z"
          //   fill="#343A40"
        />
      </g>
      <defs>
        <clipPath id="clip0_48481_186340">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
