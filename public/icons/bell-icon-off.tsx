import { type ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const bellVariant = cva('', {
  variants: {
    variant: {
      light: '',
      transparent: 'stroke-primary',
      dark: 'stroke-new-off-white',
    },
    type: {
      stroke: '',
      fill: '',
    },
  },
  compoundVariants: [
    { variant: 'light', type: 'stroke', className: 'stroke-primary' },
    { variant: 'light', type: 'fill', className: 'fill-primary' },
  ],
})

type Props = Readonly<
  ComponentProps<'svg'> & VariantProps<typeof bellVariant> & { variant?: 'light' | 'transparent' | 'dark' | null }
>

export function BellIconOff({ variant = 'light', ...props }: Readonly<Props>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.1053 18.5C10.1053 19.6046 11.0121 20.5 12.1306 20.5C13.2492 20.5 14.1559 19.6046 14.1559 18.5"
        fill="white"
        className={bellVariant({ variant, type: 'fill' })}
      />
      <path
        d="M10.1053 18.5C10.1053 19.6046 11.0121 20.5 12.1306 20.5C13.2492 20.5 14.1559 19.6046 14.1559 18.5"
        stroke="white"
        strokeWidth="1.5"
        className={bellVariant({ variant, type: 'stroke' })}
      />
      <circle cx="12.1266" cy="2.5" r="1" stroke="white" className={bellVariant({ variant, type: 'stroke' })} />
      <path
        d="M21 3L3 21"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={bellVariant({ variant, type: 'stroke' })}
      />
      <path
        d="M15.8692 5.39425C16.1868 5.07671 16.1627 4.55097 15.7837 4.31016C14.7269 3.63882 13.473 3.25 12.1284 3.25C8.35847 3.25 5.30237 6.30607 5.30237 10.076V14.4725C5.30237 14.9918 5.81728 15.3539 6.30595 15.1783V15.1783C6.60376 15.0714 6.80237 14.789 6.80237 14.4725V10.076C6.80237 7.1345 9.18689 4.75 12.1284 4.75C13.1187 4.75 14.046 5.02032 14.8403 5.49121C15.1702 5.68673 15.5981 5.66538 15.8692 5.39425V5.39425Z"
        fill="white"
        className={bellVariant({ variant, type: 'fill' })}
      />
      <path
        d="M8.0827 18.4697C8.22335 18.329 8.41412 18.25 8.61303 18.25H18.3776L20.5625 18.3279V18.3279C20.8234 18.4305 20.9887 18.6894 20.972 18.9693L20.9642 19.1001C20.9615 19.1469 20.9557 19.1938 20.9408 19.2383C20.8394 19.5414 20.5545 19.75 20.2297 19.75H8.61303C7.94485 19.75 7.61022 18.9421 8.0827 18.4697V18.4697Z"
        fill="white"
        className={bellVariant({ variant, type: 'fill' })}
      />
      <path
        d="M18.9385 9.60727C18.8958 8.97778 18.1489 8.77137 17.7028 9.21752V9.21752C17.526 9.39427 17.4427 9.6415 17.4512 9.89133C17.4533 9.95262 17.4544 10.0142 17.4544 10.076V15C17.4544 16.4437 17.8756 17.505 18.3776 18.25L20.5625 18.3279C20.5261 18.3061 20.4333 18.2487 20.3596 18.1942C20.2119 18.0848 20.0069 17.9086 19.7998 17.6529C19.3932 17.1511 18.9544 16.3152 18.9544 15V10.076C18.9544 9.91843 18.949 9.76214 18.9385 9.60727Z"
        fill="white"
        className={bellVariant({ variant, type: 'fill' })}
      />
    </svg>
  )
}
