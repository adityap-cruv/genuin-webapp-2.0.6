import { type ComponentProps } from 'react'

type Props = ComponentProps<'svg'>
export function PlayStoreIcon({ ...props }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" {...props}>
      <path
        d="M0.92869 0.247445C0.741274 0.43873 0.632812 0.736541 0.632812 1.12222V14.8791C0.632812 15.2648 0.741274 15.5626 0.92869 15.7539L0.974947 15.7959L8.88152 8.0901V7.90815L0.974947 0.202347L0.92869 0.247445Z"
        fill="url(#paint0_linear_40126_507347)"
      />
      <path
        d="M11.5154 10.6592L8.88281 8.08928V7.90733L11.5186 5.33744L11.5776 5.37087L14.6991 7.10254C15.5899 7.59397 15.5899 8.40265 14.6991 8.89719L11.5776 10.6257L11.5154 10.6592Z"
        fill="url(#paint1_linear_40126_507347)"
      />
      <path
        d="M11.5773 10.6261L8.88252 7.99868L0.929688 15.7535C1.22557 16.0567 1.70806 16.0933 2.25675 15.79L11.5773 10.6261Z"
        fill="url(#paint2_linear_40126_507347)"
      />
      <path
        d="M11.5773 5.37159L2.25675 0.207693C1.70806 -0.0924514 1.22557 -0.0559064 0.929688 0.247349L8.88252 7.99902L11.5773 5.37159Z"
        fill="url(#paint3_linear_40126_507347)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_40126_507347"
          x1="8.17951"
          y1="15.0224"
          x2="-2.25685"
          y2="4.31845"
          gradientUnits="userSpaceOnUse">
          <stop stopColor="#00A0FF" />
          <stop offset="0.0066" stopColor="#00A1FF" />
          <stop offset="0.2601" stopColor="#00BEFF" />
          <stop offset="0.5122" stopColor="#00D2FF" />
          <stop offset="0.7604" stopColor="#00DFFF" />
          <stop offset="1" stopColor="#00E3FF" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_40126_507347"
          x1="15.8591"
          y1="7.99744"
          x2="0.42117"
          y2="7.99744"
          gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE000" />
          <stop offset="0.4087" stopColor="#FFBD00" />
          <stop offset="0.7754" stopColor="#FFA500" />
          <stop offset="1" stopColor="#FF9C00" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_40126_507347"
          x1="10.112"
          y1="6.57036"
          x2="-4.04058"
          y2="-7.94507"
          gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF3A44" />
          <stop offset="1" stopColor="#C31162" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_40126_507347"
          x1="-1.0722"
          y1="20.3307"
          x2="5.24754"
          y2="13.8489"
          gradientUnits="userSpaceOnUse">
          <stop stopColor="#32A071" />
          <stop offset="0.0685" stopColor="#2DA771" />
          <stop offset="0.4762" stopColor="#15CF74" />
          <stop offset="0.8009" stopColor="#06E775" />
          <stop offset="1" stopColor="#00F076" />
        </linearGradient>
      </defs>
    </svg>
  )
}
