import { type ComponentProps } from 'react'

type Props = ComponentProps<'svg'>
export function LogoutIcon({ ...props }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M2.70679 9.60842C3.06013 8.20363 4.1313 6.34222 5.83854 4.93646C7.54578 3.53069 9.70128 2.76471 11.925 2.77351C13.7156 2.78322 15.4663 3.29621 16.9719 4.25235C18.4776 5.20848 19.6758 6.56818 20.4262 8.17208C21.1765 9.77598 21.448 11.5577 21.2088 13.3083C20.9695 15.059 20.2295 16.7061 19.0754 18.0567C17.9212 19.4073 16.4008 20.4054 14.6922 20.934C12.9837 21.4627 11.1578 21.4999 9.42858 21.0415C7.69933 20.583 6.13832 19.6479 4.92852 18.3455C3.71872 17.0432 3.06013 15.93 2.70679 14.5252"
        // stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M2.25 12L16.5 12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 7.5L16.5 12L12 16.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
