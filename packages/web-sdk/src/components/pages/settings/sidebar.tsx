import { ComponentProps } from 'react'
import { cn } from '@/utils'
import { SettingsMenu } from './menu'

type SideBarPropsType = ComponentProps<'nav'>

export function SideBar({ className, ...restProps }: SideBarPropsType) {
  return (
    <nav
      className={cn(
        'hidden h-full w-fit md:flex flex-col bg-background transition-[width] rounded-2xl border border-tertiary-300 p-4',
        className,
      )}
      {...restProps}>
      <SettingsMenu />
    </nav>
  )
}
