import { type ComponentProps } from 'react'
import { Default } from './default'
import { Settings } from './settings'

export type PageShellProps = {
  children: React.ReactNode
} & ComponentProps<'section'>

export const PageShell = { default: Default, settings: Settings }

export default Default
