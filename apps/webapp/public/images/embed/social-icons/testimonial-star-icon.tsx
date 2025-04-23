import { cn } from '@/lib/utils'
import { type ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const starVariant = cva('', {
  variants: {
    variant: {
      filled: 'fill-yellow-500', // You can adjust the color
      outlined: 'fill-none stroke-black', // Adjust the stroke for outlined stars
    },
  },
})

type IconPropsType = ComponentProps<'svg'> &
  VariantProps<typeof starVariant> & { variant?: 'filled' | 'outlined' | null }

export function TestimonialStarIcon({ variant = 'filled', className, ...props }: IconPropsType) {
  return (
    <svg
      className={cn('', className)}
      width="24"
      height="25"
      viewBox="0 0 24 25"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <path
        d="M21.946 9.90008C21.8832 9.71495 21.7675 9.55228 21.6132 9.43214C21.459 9.31201 21.2729 9.23968 21.078 9.22408L15.377 8.77108L12.91 3.31008C12.8315 3.1342 12.7037 2.98481 12.5421 2.87994C12.3805 2.77508 12.192 2.71922 11.9994 2.71912C11.8067 2.71901 11.6182 2.77466 11.4565 2.87935C11.2948 2.98403 11.1668 3.13328 11.088 3.30908L8.62105 8.77108L2.92005 9.22408C2.7285 9.23926 2.54539 9.30929 2.3926 9.42581C2.23982 9.54234 2.12384 9.7004 2.05854 9.88111C1.99324 10.0618 1.98139 10.2575 2.02439 10.4448C2.0674 10.6321 2.16345 10.803 2.30105 10.9371L6.51405 15.0441L5.02405 21.4961C4.97881 21.6914 4.99331 21.8958 5.06567 22.0827C5.13803 22.2697 5.26491 22.4306 5.42985 22.5445C5.59479 22.6585 5.79017 22.7202 5.99063 22.7217C6.1911 22.7233 6.38739 22.6645 6.55405 22.5531L11.999 18.9231L17.444 22.5531C17.6144 22.6662 17.8153 22.7244 18.0197 22.7199C18.2241 22.7154 18.4222 22.6485 18.5874 22.528C18.7527 22.4076 18.877 22.2394 18.9438 22.0462C19.0106 21.8529 19.0166 21.6438 18.961 21.4471L17.132 15.0471L21.668 10.9651C21.965 10.6971 22.074 10.2791 21.946 9.90008Z"
        className={cn(starVariant({ variant }), className)}
      />
    </svg>
  )
}
