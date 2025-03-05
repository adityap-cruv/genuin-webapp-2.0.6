import { type ComponentProps } from 'react'

type Props = ComponentProps<'svg'>
export function WalletInHandIcon({ ...props }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="20"
      viewBox="0 0 22 20"
      fill="none"
      stroke="black"
      {...props}>
      <g opacity="0.75">
        <path
          d="M8.90123 13.4567L11.8642 14.4444C11.8642 14.4444 19.2716 12.9629 20.2593 12.9629C21.2469 12.9629 21.2469 13.9505 20.2593 14.9382C19.2716 15.9259 15.8148 18.8888 12.8519 18.8888C9.88889 18.8888 7.91358 17.4073 5.93827 17.4073H1"
          //   stroke="#D91E18"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M1 11.4815C1.98765 10.4938 3.96296 9.01232 5.93827 9.01232C7.91358 9.01232 12.6049 10.9876 13.3457 11.9753C14.0864 12.9629 11.8642 14.4444 11.8642 14.4444M6.92593 6.04936V2.09874C6.92593 1.8368 7.02998 1.58558 7.2152 1.40036C7.40042 1.21514 7.65164 1.11108 7.91358 1.11108H19.7654C20.0274 1.11108 20.2786 1.21514 20.4638 1.40036C20.649 1.58558 20.7531 1.8368 20.7531 2.09874V9.99997"
          //   stroke="#D91E18"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.3702 1.11108H16.3085V5.55553H11.3702V1.11108Z"
          //   stroke="#D91E18"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}
