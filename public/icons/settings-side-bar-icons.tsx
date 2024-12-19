import { cn } from '@lib/utils'
import { type ComponentProps } from 'react'
type Props = { variant?: string; isActive?: boolean; className?: string } & ComponentProps<'svg'>

export function EditIcon({ isActive, className, ...props }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      {...props}
      className={cn(isActive ? 'fill-primary' : 'fill-secondary', className)}>
      <path d="M16.5196 2.13928C17.0119 1.6474 17.6793 1.37109 18.3751 1.37109C19.071 1.37109 19.7384 1.6474 20.2306 2.13928L21.8596 3.76828C22.3515 4.26051 22.6278 4.92791 22.6278 5.62378C22.6278 6.31966 22.3515 6.98705 21.8596 7.47928L8.94464 20.3943C8.62964 20.7093 8.23964 20.9403 7.81064 21.0618L2.93414 22.4568C2.74113 22.5119 2.53687 22.5145 2.34255 22.4641C2.14824 22.4137 1.97095 22.3122 1.82908 22.1702C1.68721 22.0281 1.58592 21.8507 1.53573 21.6564C1.48554 21.462 1.48827 21.2577 1.54364 21.0648L2.93714 16.1898C3.05864 15.7608 3.28964 15.3693 3.60464 15.0528L16.5196 2.13778V2.13928ZM16.7836 9.37378L14.6251 7.21378L5.19614 16.6443C5.15104 16.6894 5.11802 16.7451 5.10014 16.8063L4.26314 19.7358L7.19264 18.8988C7.25385 18.8809 7.30957 18.8479 7.35464 18.8028L16.7836 9.37378ZM18.6406 3.72928C18.6058 3.69436 18.5644 3.66665 18.5189 3.64775C18.4733 3.62884 18.4245 3.61911 18.3751 3.61911C18.3258 3.61911 18.277 3.62884 18.2314 3.64775C18.1859 3.66665 18.1445 3.69436 18.1096 3.72928L16.2166 5.62378L18.3751 7.78378L20.2696 5.88928C20.3046 5.85445 20.3323 5.81307 20.3512 5.76751C20.3701 5.72195 20.3798 5.67311 20.3798 5.62378C20.3798 5.57446 20.3701 5.52562 20.3512 5.48006C20.3323 5.4345 20.3046 5.39312 20.2696 5.35828L18.6406 3.72928Z" />
    </svg>
  )
}

export function AccountIcon({ isActive, className, ...props }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      {...props}
      className={cn(isActive ? 'stroke-primary' : 'stroke-secondary', className)}>
      <g clipPath="url(#clip0_16004_222091)">
        <path d="M-277.334 -137.334V-81.334H-341.334V109.333H305.333V-137.334H-277.334Z" strokeMiterlimit="10" />
        <circle
          cx="16"
          cy="16"
          r="12"
          style={{
            stroke: `${isActive ? 'var(--primary)' : 'var(--secondary)'}`,
          }}
          strokeWidth="2"
        />
        <circle
          cx="16.1237"
          cy="12.7487"
          r="3.74872"
          style={{
            stroke: `${isActive ? 'var(--primary)' : 'var(--secondary)'}`,
          }}
          strokeWidth="2"
        />
        <path
          d="M9 22.1272C11.1558 19.4993 17.2707 16.4682 22.9296 22.1272"
          style={{
            stroke: `${isActive ? 'var(--primary)' : 'var(--secondary)'}`,
          }}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_16004_222091">
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

export function NotificationIcon({ variant, isActive, className, ...props }: Props) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      className={cn(
        variant === 'white' ? 'stroke-new-off-white' : isActive ? 'stroke-primary' : 'stroke-secondary',
        className
      )}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.1284 4C15.484 4 18.2044 6.72029 18.2044 10.076C18.2044 11.9639 18.2044 13.8496 18.2044 15C18.2044 18 20.2297 19 20.2297 19L4.02705 19C4.02705 19 6.05238 18 6.05238 15C6.05238 13.8496 6.05238 11.9639 6.05238 10.076C6.05238 6.72029 8.77269 4 12.1284 4V4Z"
        style={{
          stroke: `${variant === 'white' ? 'white' : isActive ? 'var(--primary)' : 'var(--secondary)'}`,
        }}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.1053 18.5C10.1053 19.6046 11.0121 20.5 12.1306 20.5C13.2492 20.5 14.156 19.6046 14.156 18.5"
        fill="white"
      />
      <path
        d="M10.1053 18.5C10.1053 19.6046 11.0121 20.5 12.1306 20.5C13.2492 20.5 14.156 19.6046 14.156 18.5"
        style={{
          stroke: `${variant === 'white' ? 'white' : isActive ? 'var(--primary)' : 'var(--secondary)'}`,
        }}
        strokeWidth="1.5"
      />
      <circle
        cx="12.1266"
        cy="2.5"
        r="1"
        style={{
          stroke: `${variant === 'white' ? 'white' : isActive ? 'var(--primary)' : 'var(--secondary)'}`,
        }}
      />
    </svg>
  )
}

export function PersonalizationIcon({ variant, isActive, className, ...props }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      {...props}
      className={cn(isActive ? 'stroke-primary' : 'stroke-secondary', className)}>
      <path
        d="M7.4092 9.84375H2.66602"
        style={{
          stroke: `${isActive ? 'var(--primary)' : 'var(--secondary)'}`,
        }}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M29.3344 9.84375H13.5254"
        style={{
          stroke: `${isActive ? 'var(--primary)' : 'var(--secondary)'}`,
        }}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.4762 22.3242H2.66602"
        style={{
          stroke: `${isActive ? 'var(--primary)' : 'var(--secondary)'}`,
        }}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M29.3345 22.3242H24.5938"
        style={{
          stroke: `${isActive ? 'var(--primary)' : 'var(--secondary)'}`,
        }}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.40625 9.66761C7.40625 10.4787 7.72846 11.2566 8.30199 11.8301C8.87552 12.4036 9.65339 12.7259 10.4645 12.7259C11.2756 12.7259 12.0535 12.4036 12.627 11.8301C13.2005 11.2566 13.5227 10.4787 13.5227 9.66761C13.5227 8.85652 13.2005 8.07864 12.627 7.50511C12.0535 6.93158 11.2756 6.60938 10.4645 6.60938C9.65339 6.60938 8.87552 6.93158 8.30199 7.50511C7.72846 8.07864 7.40625 8.85652 7.40625 9.66761Z"
        style={{
          stroke: `${isActive ? 'var(--primary)' : 'var(--secondary)'}`,
        }}
        strokeWidth="2"
      />
      <path
        d="M18.4746 22.3278C18.4746 23.1389 18.7968 23.9167 19.3703 24.4903C19.9439 25.0638 20.7218 25.386 21.5328 25.386C22.3439 25.386 23.1218 25.0638 23.6953 24.4903C24.2689 23.9167 24.5911 23.1389 24.5911 22.3278C24.5911 21.5167 24.2689 20.7388 23.6953 20.1653C23.1218 19.5917 22.3439 19.2695 21.5328 19.2695C20.7218 19.2695 19.9439 19.5917 19.3703 20.1653C18.7968 20.7388 18.4746 21.5167 18.4746 22.3278Z"
        style={{
          stroke: `${isActive ? 'var(--primary)' : 'var(--secondary)'}`,
        }}
        strokeWidth="2"
      />
    </svg>
  )
}

export function ContactUsIcon({ isActive, className, ...props }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      {...props}
      className={cn(isActive ? 'stroke-primary' : 'stroke-secondary', className)}>
      <g clipPath="url(#clip0_16004_222103)">
        <path
          d="M-277.334 -137.334V-81.334H-341.334V109.333H305.333V-137.334H-277.334Z"
          style={{
            stroke: `${isActive ? 'var(--primary)' : 'var(--secondary)'}`,
          }}
          strokeMiterlimit="10"
        />
        <path
          d="M12.0003 12.5655C11.9982 12.6159 12.0064 12.6662 12.0244 12.7132C12.0424 12.7603 12.0699 12.8032 12.1051 12.8393C12.1403 12.8754 12.1825 12.9039 12.2291 12.9231C12.2758 12.9422 12.3258 12.9517 12.3762 12.9508H13.663C13.8782 12.9508 14.0498 12.7745 14.0779 12.5608C14.2182 11.5377 14.9201 10.7921 16.171 10.7921C17.241 10.7921 18.2205 11.3271 18.2205 12.6139C18.2205 13.6043 17.6371 14.0597 16.7153 14.7522C15.6657 15.5149 14.8343 16.4055 14.8936 17.8514L14.8983 18.1898C14.8999 18.2922 14.9417 18.3898 15.0147 18.4615C15.0876 18.5333 15.1859 18.5735 15.2882 18.5735H16.5531C16.6566 18.5735 16.7557 18.5324 16.8289 18.4593C16.902 18.3862 16.9431 18.287 16.9431 18.1836V18.0198C16.9431 16.9 17.3689 16.574 18.5184 15.7021C19.4682 14.9799 20.4587 14.1783 20.4587 12.4953C20.4587 10.1386 18.4685 9 16.2895 9C14.3134 9 12.1485 9.92023 12.0003 12.5655ZM14.4288 21.5541C14.4288 22.3855 15.0917 23 16.0041 23C16.954 23 17.6075 22.3855 17.6075 21.5541C17.6075 20.6932 16.9524 20.088 16.0026 20.088C15.0917 20.088 14.4288 20.6932 14.4288 21.5541Z"
          className={cn(isActive ? 'fill-primary' : 'fill-secondary')}
        />
        <circle
          cx="16"
          cy="16"
          r="12"
          style={{
            stroke: `${isActive ? 'var(--primary)' : 'var(--secondary)'}`,
          }}
          strokeWidth="2"
        />
      </g>
      <defs>
        <clipPath id="clip0_16004_222103">
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

export function LogOutIcon({ isActive, className, ...props }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      {...props}
      className={cn(isActive ? '' : '', className)}>
      <path
        d="M3.60938 12.8125C4.0805 10.9395 5.50872 8.4576 7.78505 6.58325C10.0614 4.7089 12.9354 3.68758 15.9004 3.69932C18.2878 3.71227 20.622 4.39625 22.6296 5.6711C24.6371 6.94595 26.2347 8.75887 27.2352 10.8974C28.2357 13.0359 28.5977 15.4115 28.2787 17.7457C27.9597 20.0799 26.973 22.2761 25.4342 24.0769C23.8953 25.8777 21.868 27.2085 19.59 27.9133C17.3119 28.6182 14.8774 28.6679 12.5718 28.0566C10.2661 27.4454 8.18476 26.1985 6.57169 24.462C4.95862 22.7256 4.0805 21.2413 3.60938 19.3682"
        style={{
          stroke: `${isActive ? 'var(--primary)' : 'var(--secondary)'}`,
        }}
        strokeWidth="2"
      />
      <path
        d="M3 16L22 16"
        style={{
          stroke: `${isActive ? 'var(--primary)' : 'var(--secondary)'}`,
        }}
        strokeWidth="2"
      />
      <path
        d="M16 10L22 16L16 22"
        style={{
          stroke: `${isActive ? 'var(--primary)' : 'var(--secondary)'}`,
        }}
        strokeWidth="2"
      />
    </svg>
  )
}
